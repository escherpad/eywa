/** Created by ge on 5/12/16.
 * dropbox documentation can be found here:
 * link: https://www.dropbox.com/developers/documentation/http/documentation
 * */

import rpcRequest from "./rpcRequest"
import contentRequest from "./contentRequest"

/** OAuth Business Methods */
export function getOAuthUrl(client_id, redirect_uri, state) {
  let url = 'https://www.dropbox.com/1/oauth2/authorize';
  let params = {
    response_type: "token",
    client_id,
    redirect_uri,
    state
  };
  let path = url + "?" + Object.keys(params).map(k => `${k}=${params[k]}`).join("&");
  return path
}
/* open a new window for the OAuth authorization */
export function requestAccessToken(client_id, redirect_uri, state) {
  let path = getOAuthUrl(client_id, redirect_uri, state);
  window.open(path, "Connect To Dropbox", "modal=yes,alwaysRaised=yes");
  return path;
}

// not tested
/* parse the oauth redirect url to get the accessToken */
export function parseTokenQueryString() {
  "use strict";
  const locationHash = window.location.hash;
  var objectLiteral = locationHash.replace(/&/g, '","').replace(/=/g, '":"').replace(/(\?|#)/, '{"') + '"}';
  const {hash, access_token, token_type, state, uid} = JSON.parse(objectLiteral);
  return {
    hash,
    accessToken: access_token,
    tokenType: token_type,
    uid,
    state
  };
}

/** API methods */
export default class DropboxApi {
  constructor(clientId, oauthRedirectUri) {
    this.clientId = clientId;
    this.redirectURI = oauthRedirectUri;
    this.rpcRoot = 'https://api.dropboxapi.com/2/';
    this.longPollRoot = 'https://notify.dropboxapi.com/2/';
    this.contentRoot = 'https://content.dropboxapi.com/2/';
  }

  updateAccessToken(accessToken) {
    this.accessToken = accessToken;
    return this;
  }

  getOAuthUrl(state) {
    return getOAuthUrl(this.clientId, this.redirectURI, state);
  }

  requestAuth(state) {
    return requestAccessToken(this.clientId, this.redirectURI, state);
  }

  onRedirect() {
    let parsed = parseTokenQueryString();
    this.updateAccessToken(parsed.accessToken);
    return parsed;
  }

  rpc(method, path, params, body) {
    return rpcRequest(this.accessToken, method, this.rpcRoot + path, params, body);
  }

  longPoll(path, body) {
    return fetch(this.longPollRoot + path, {
      method: "POST",
      mode: 'cors',
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(body)
    })
      .then(res => res.json());
  }

  content(path, arg, content = undefined) {
    return contentRequest(this.accessToken, "post", this.contentRoot + path, arg, content).then(res => {
      if (typeof content === "undefined") return res;
      else return res.json();
    })
  }

  upload(path, content, mode = "add", autorename = true, mute = false, client_modified = undefined) {
    if (client_modified) return this.content('files/upload', {path, mode, autorename, mute, client_modified}, content);
    else return this.content('files/upload', {path, mode, autorename, mute}, content);
  }

  download(path) {
    return this.content('files/download', {path}).then(res => {
      const metadata = JSON.parse(res.headers.get('dropbox-api-result'));
      return res.text().then((content) => {
        return {metadata, content};
      })
    })
  }

  downloadBlob(path) {
    return this.content('files/download', {path}).then(res => {
      const metadata = JSON.parse(res.headers.get('dropbox-api-result'));
      return res.blob().then((blob) => {
        return {metadata, blob};
      })
    })
  }

  downloadArrayBuffer(path) {
    return this.content('files/download', {path}).then(res => {
      const metadata = JSON.parse(res.headers.get('dropbox-api-result'));
      return res.arrayBuffer().then((arrayBuffer) => {
        return {metadata, arrayBuffer};
      })
    })
  }

  getAccountInfo() {
    return this.rpc('post', "users/get_current_account");
  }

  list(path = "", recursive = false, media = false, deleted = false, shared = false) {
    if (path == "/") path = ""; // api require root to be a empty string instead of "/".
    return this.rpc('post', "files/list_folder", {
      path, recursive,
      include_media_info: media,
      include_deleted: deleted,
      include_has_explicit_shared_members: shared
    });
  }

  listFeed(cursor, timeout) {
    if (!cursor) throw Error('need cursor in list feed long-polling');
    let body = {cursor};
    if (timeout) body.timeout = timeout;
    return this.longPoll("files/list_folder/longpoll", body);
  }

  listContinue(cursor) {
    if (!cursor) throw Error('need cursor in list continue');
    return this.rpc('post', "files/list_folder/continue", {cursor});
  }

  createFolder(path) {
    return this.rpc('post', "files/create_folder", {path});
  }

  remove(path) {
    return this.rpc('post', "files/delete", {path});
  }


  removePermanently(path) {
    if (!this.isBusiness)
      throw Error("permanently_delete is only available for business account");
    return this.rpc('post', this.rpcRoot + "files/permanently_delete", {path});
  }

  getRevisions(path) {
    return this.rpc('post', "files/list_revisions", {path});
  }

  getPreview(path) {
    return this.content('files/get_preview', {path}).then(res => {
      const metadata = JSON.parse(res.headers.get('dropbox-api-result'));
      return res.blob().then((blob) => {
        return {metadata, blob};
      })
    });
  }

  restore(path, rev = "") {
    return this.rpc('post', "files/restore", {path, rev});
  }

  copy(from, to) {
    return this.rpc("post", "files/copy", {from_path: from, to_path: to});
  }

  move(from, to) {
    return this.rpc("post", "files/move", {from_path: from, to_path: to});
  }

  search(query, path = "", start = 0, max_results = 10, mode = "filename") {
    // note: mode is one of [filename, filename_and_content, deleted_filename]
    return this.rpc("post", "files/search", {query, path, start, max_results, mode});
  }

  // addProperty: "rpc://[POST]files/properties/add?path",
  // putProperty: "rpc://[POST]files/properties/overwrite?path",
  // removeProperty: "rpc://[POST]files/properties/remove?path",
  // updateProperty: "rpc://[POST]files/properties/update?path"
};

