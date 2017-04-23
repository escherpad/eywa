/** Created by ge on 5/12/16.
 * dropbox documentation can be found here:
 * link: https://www.dropbox.com/developers/documentation/http/documentation
 * todo: OAuth
 * todo: create
 * todo: get
 * todo: delete
 * todo: update
 * todo: move
 * */

import jsonRequest from "./jsonRequest";
import contentRequest from "./contentRequest";

/** OAuth Helper Methods */
export function getOAuthUrl(client_id, redirect_uri, scope, state, allow_signup = "true") {
  let url = 'https://github.com/login/oauth/authorize';
  let params = {
    response_type: "token",
    client_id,
    scope,
    state,
    allow_signup
  };
  if (redirect_uri) params.redirect_uri = redirect_uri;
  let path = url + "?" + Object.keys(params).map(k => `${k}=${params[k]}`).join("&");
  return path
}
/** Request Token by opening a new window for the OAuth authorization */
export function requestAccessToken(client_id, redirect_uri, scope, state, allow_signup) {
  let path = getOAuthUrl(client_id, redirect_uri, scope, state, allow_signup);
  window.open(path, "Connect To GitHub", "");
  return path;
}

// not tested
/* parse the oauth redirect url to get the accessToken */
export function parseTokenQueryString() {
  "use strict";
  const href = window.location.href;
  if (href.split('?').length < 2) throw Error("url is missing the query.");
  let objectLiteral = '{"' + href.split("?")[1].replace(/&/g, '","').replace(/=/g, '":"') + '"}';
  const {code, state, scope} = JSON.parse(objectLiteral);
  return {
    href,
    state,
    code,
    scope
  };
}

/** API methods */
export default class GitHubApi {
  constructor(clientId, oauthRedirectUri) {
    this.clientId = clientId;
    // this.clientSecret = clientSecret;
    this.redirectURI = oauthRedirectUri;
    this.root = 'https://api.github.com';
  }

  updateAccessToken(accessToken, tokenType = "bearer") {
    this.accessToken = accessToken;
    this.tokenType = tokenType;
    return this;
  }

  getOAuthUrl(scope, state, allow_signup) {
    return getOAuthUrl(this.clientId, this.redirectURI, scope, state, allow_signup);
  }

  requestAuth(scope, state, allow_signup) {
    return requestAccessToken(this.clientId, this.redirectURI, scope, state, allow_signup);
  }

  /** GitHub OAuth Flow does not support getting `access_token` in the browser:
   * https://github.com/isaacs/github/issues/330
   * need a private server to retrieve the access token.
   */
  onRedirect() {
    const {code, state, scope} = parseTokenQueryString();
    // request token with code
    return this.getAccessTokenViaCode(code, state).then((res) => {
      this.updateAccessToken(res.access_token, res.token_type);
      return {
        accessToken: res.access_token,
        tokenType: res.token_type
      }
    });
  }

  request(method, path, params, data, no_parse) {
    return jsonRequest(this.accessToken, this.tokenType, method, this.root + path, params, data, no_parse)
  }

  contentRequest(method, path, params, data, no_parse) {
    return contentRequest(this.accessToken, this.tokenType, method, this.root + path, params, data, no_parse)
  }

  getAccessTokenViaCode(code) {
    /** Let a web server keep the client_secret and handles this access_token retrieval step.
     * currently, this can not be completed directly in a browser:
     * https://github.com/isaacs/github/issues/330
     * */
    return fetch(`http://localhost/gatekeeper/?client_id=${this.clientId}code=${code}`)
  }
  // getAccessTokenViaCode(code, state) {
  //   const params = {
  //     client_id: this.clientId,
  //     client_secret: this.clientSecret,
  //     code,
  //     state
  //   };
  //   let paramString = Object.keys(params).map(key => {
  //     return key + "=" + params[key]
  //   }).join('&');
  //   return fetch("https://github.com/login/oauth/access_token" + "?" + paramString, {
  //     method: "POST",
  //     mode: 'no-cors',
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json; charset=utf-8",
  //       "Access-Control-Allow-Origin": "*",
  //       "Access-Control-Allow-Credentials": true
  //     }
  //   })
  //     .then(res => res.json());
  // }

  listGists(username, since) {
    let path = "/gists";
    if (username) {
      path = "/users/" + username + path;
    }
    if (typeof since == "undefined") {
      return this.request("get", path, null)
    } else {
      return this.request("get", path, null, {since})
    }
  }

  getGist(id, revision) {
    if (revision) {
      return this.request("get", "/gists/" + id + '/' + revision)
    } else {
      return this.request("get", "/gists/" + id)
    }
  }

  createGist(files, description, is_public = false) {
    return this.request("post", "/gists", null, {files, description, public: is_public})
  }

  updateGist(id, files, description) {
    let data = {files};
    if (description) data.description = description;
    return this.request("patch", "/gists/" + id, null, data)
  }

  // backlog: listGistCommits
  // backlog: listGistForks
  // backlog: fortGist

  deleteGist(id) {
    return this.request("delete", "/gists/" + id, null, null, true)
  }

  /** repository content API endpoints */

  // backlog: getDefaultReadme

  /** the same for getting the content of a file and a folder */
  getContents(owner, repo, path, ref) {
    path = ref ? (path + "/" + ref) : path;
    return this.contentRequest("get", "/repos/" + owner + "/" + repo + "/contents" + path)
  }

  /** the only difference between createFile and updateFile is the absence of SHA */
  createFile(owner, repo, path, commit_message, content, branch, committer) {
    let data = {
      message: commit_message,
      content
    };
    if (branch) data.branch = branch;
    if (committer) data.committer = committer;
    return this.request("put", "/repos/" + owner + "/" + repo + "/contents" + path, null, data)
  }

  /** need to have the sha of file being replaced */
  updateFile(owner, repo, path, commit_message, content, sha, branch, committer) {
    let data = {
      message: commit_message,
      content,
      sha
    };
    if (branch) data.branch = branch;
    if (committer) data.committer = committer;
    return this.request("put", "/repos/" + owner + "/" + repo + "/contents" + path, null, data)
  }

  deleteFile(owner, repo, path, commit_message, sha, branch, committer) {
    let data = {
      message: commit_message,
      sha
    };
    if (branch) data.branch = branch;
    if (committer) data.committer = committer;
    return this.request("delete", "/repos/" + owner + "/" + repo + "/contents" + path, null, data, true)
  }

  /** get archive link, always returns 302 code */
  getFileArchive(owner, repo, path, archive_format, ref) {
    return this.contentRequest("get", "/repos/" + owner + "/" + repo + "/" + archive_format + "/" + ref)
  }


};

