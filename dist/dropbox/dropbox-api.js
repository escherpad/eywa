"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.getOAuthUrl = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /** Created by ge on 5/12/16.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * dropbox documentation can be found here:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * link: https://www.dropbox.com/developers/documentation/http/documentation
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * */

exports.requestAccessToken = requestAccessToken;
exports.parseTokenQueryString = parseTokenQueryString;

var _rpcRequest = require("./rpcRequest");

var _rpcRequest2 = _interopRequireDefault(_rpcRequest);

var _contentRequest = require("./contentRequest");

var _contentRequest2 = _interopRequireDefault(_contentRequest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/** OAuth Business Methods */
function _getOAuthUrl(client_id, redirect_uri, state) {
  var url = 'https://www.dropbox.com/1/oauth2/authorize';
  var params = {
    response_type: "token",
    client_id: client_id,
    redirect_uri: redirect_uri,
    state: state
  };
  var path = url + "?" + Object.keys(params).map(function (k) {
    return k + "=" + params[k];
  }).join("&");
  return path;
}
/* open a new window for the OAuth authorization */
exports.getOAuthUrl = _getOAuthUrl;
function requestAccessToken(client_id, redirect_uri, state) {
  var path = _getOAuthUrl(client_id, redirect_uri, state);
  window.open(path, "Connect To Dropbox", "modal=yes,alwaysRaised=yes");
  return path;
}

// not tested
/* parse the oauth redirect url to get the accessToken */
function parseTokenQueryString() {
  "use strict";

  var locationHash = window.location.hash;
  var objectLiteral = locationHash.replace(/&/g, '","').replace(/=/g, '":"').replace(/(\?|#)/, '{"') + '"}';

  var _JSON$parse = JSON.parse(objectLiteral);

  var hash = _JSON$parse.hash;
  var access_token = _JSON$parse.access_token;
  var token_type = _JSON$parse.token_type;
  var state = _JSON$parse.state;
  var uid = _JSON$parse.uid;

  return {
    hash: hash,
    accessToken: access_token,
    tokenType: token_type,
    uid: uid,
    state: state
  };
}

/** API methods */

var DropboxApi = function () {
  function DropboxApi(clientId, oauthRedirectUri) {
    _classCallCheck(this, DropboxApi);

    this.clientId = clientId;
    this.redirectURI = oauthRedirectUri;
    this.rpcRoot = 'https://api.dropboxapi.com/2/';
    this.longPollRoot = 'https://notify.dropboxapi.com/2/';
    this.contentRoot = 'https://content.dropboxapi.com/2/';
  }

  _createClass(DropboxApi, [{
    key: "updateAccessToken",
    value: function updateAccessToken(accessToken) {
      this.accessToken = accessToken;
      return this;
    }
  }, {
    key: "getOAuthUrl",
    value: function getOAuthUrl(state) {
      return _getOAuthUrl(this.clientId, this.redirectURI, state);
    }
  }, {
    key: "requestAuth",
    value: function requestAuth(state) {
      return requestAccessToken(this.clientId, this.redirectURI, state);
    }
  }, {
    key: "onRedirect",
    value: function onRedirect() {
      var parsed = parseTokenQueryString();
      this.updateAccessToken(parsed.accessToken);
      return parsed;
    }
  }, {
    key: "rpc",
    value: function rpc(method, path, params, body) {
      return (0, _rpcRequest2.default)(this.accessToken, method, this.rpcRoot + path, params, body);
    }
  }, {
    key: "longPoll",
    value: function longPoll(path, body) {
      return fetch(this.longPollRoot + path, {
        method: "POST",
        mode: 'cors',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }).then(function (res) {
        return res.json();
      });
    }
  }, {
    key: "content",
    value: function content(path, arg) {
      var _content = arguments.length <= 2 || arguments[2] === undefined ? undefined : arguments[2];

      return (0, _contentRequest2.default)(this.accessToken, "post", this.contentRoot + path, arg, _content).then(function (res) {
        if (typeof _content === "undefined") return res;else return res.json();
      });
    }
  }, {
    key: "upload",
    value: function upload(path, content) {
      var mode = arguments.length <= 2 || arguments[2] === undefined ? "add" : arguments[2];
      var autorename = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];
      var mute = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];
      var client_modified = arguments.length <= 5 || arguments[5] === undefined ? undefined : arguments[5];

      if (client_modified) return this.content('files/upload', { path: path, mode: mode, autorename: autorename, mute: mute, client_modified: client_modified }, content);else return this.content('files/upload', { path: path, mode: mode, autorename: autorename, mute: mute }, content);
    }
  }, {
    key: "download",
    value: function download(path) {
      return this.content('files/download', { path: path }).then(function (res) {
        var metadata = JSON.parse(res.headers.get('dropbox-api-result'));
        return res.text().then(function (content) {
          return { metadata: metadata, content: content };
        });
      });
    }
  }, {
    key: "downloadBlob",
    value: function downloadBlob(path) {
      return this.content('files/download', { path: path }).then(function (res) {
        var metadata = JSON.parse(res.headers.get('dropbox-api-result'));
        return res.blob().then(function (blob) {
          return { metadata: metadata, blob: blob };
        });
      });
    }
  }, {
    key: "downloadArrayBuffer",
    value: function downloadArrayBuffer(path) {
      return this.content('files/download', { path: path }).then(function (res) {
        var metadata = JSON.parse(res.headers.get('dropbox-api-result'));
        return res.arrayBuffer().then(function (arrayBuffer) {
          return { metadata: metadata, arrayBuffer: arrayBuffer };
        });
      });
    }
  }, {
    key: "getAccountInfo",
    value: function getAccountInfo() {
      return this.rpc('post', "users/get_current_account");
    }
  }, {
    key: "list",
    value: function list() {
      var path = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
      var recursive = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
      var media = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
      var deleted = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
      var shared = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];

      if (path == "/") path = ""; // api require root to be a empty string instead of "/".
      return this.rpc('post', "files/list_folder", {
        path: path, recursive: recursive,
        include_media_info: media,
        include_deleted: deleted,
        include_has_explicit_shared_members: shared
      });
    }
  }, {
    key: "listFeed",
    value: function listFeed(cursor, timeout) {
      if (!cursor) throw Error('need cursor in list feed long-polling');
      var body = { cursor: cursor };
      if (timeout) body.timeout = timeout;
      return this.longPoll("files/list_folder/longpoll", body);
    }
  }, {
    key: "listContinue",
    value: function listContinue(cursor) {
      if (!cursor) throw Error('need cursor in list continue');
      return this.rpc('post', "files/list_folder/continue", { cursor: cursor });
    }
  }, {
    key: "createFolder",
    value: function createFolder(path) {
      return this.rpc('post', "files/create_folder", { path: path });
    }
  }, {
    key: "remove",
    value: function remove(path) {
      return this.rpc('post', "files/delete", { path: path });
    }
  }, {
    key: "removePermanently",
    value: function removePermanently(path) {
      if (!this.isBusiness) throw Error("permanently_delete is only available for business account");
      return this.rpc('post', this.rpcRoot + "files/permanently_delete", { path: path });
    }
  }, {
    key: "getRevisions",
    value: function getRevisions(path) {
      return this.rpc('post', "files/list_revisions", { path: path });
    }
  }, {
    key: "getPreview",
    value: function getPreview(path) {
      return this.content('files/get_preview', { path: path }).then(function (res) {
        var metadata = JSON.parse(res.headers.get('dropbox-api-result'));
        return res.blob().then(function (blob) {
          return { metadata: metadata, blob: blob };
        });
      });
    }
  }, {
    key: "restore",
    value: function restore(path) {
      var rev = arguments.length <= 1 || arguments[1] === undefined ? "" : arguments[1];

      return this.rpc('post', "files/restore", { path: path, rev: rev });
    }
  }, {
    key: "copy",
    value: function copy(from, to) {
      return this.rpc("post", "files/copy", { from_path: from, to_path: to });
    }
  }, {
    key: "move",
    value: function move(from, to) {
      return this.rpc("post", "files/move", { from_path: from, to_path: to });
    }
  }, {
    key: "search",
    value: function search(query) {
      var path = arguments.length <= 1 || arguments[1] === undefined ? "" : arguments[1];
      var start = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
      var max_results = arguments.length <= 3 || arguments[3] === undefined ? 10 : arguments[3];
      var mode = arguments.length <= 4 || arguments[4] === undefined ? "filename" : arguments[4];

      // note: mode is one of [filename, filename_and_content, deleted_filename]
      return this.rpc("post", "files/search", { query: query, path: path, start: start, max_results: max_results, mode: mode });
    }

    // addProperty: "rpc://[POST]files/properties/add?path",
    // putProperty: "rpc://[POST]files/properties/overwrite?path",
    // removeProperty: "rpc://[POST]files/properties/remove?path",
    // updateProperty: "rpc://[POST]files/properties/update?path"

  }]);

  return DropboxApi;
}();

exports.default = DropboxApi;
;