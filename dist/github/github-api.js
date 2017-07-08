"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOAuthUrl = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /** Created by ge on 5/12/16.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * dropbox documentation can be found here:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * link: https://www.dropbox.com/developers/documentation/http/documentation
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * todo: OAuth
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * todo: create
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * todo: get
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * todo: delete
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * todo: update
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * todo: move
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * */

exports.requestAccessToken = requestAccessToken;
exports.parseTokenQueryString = parseTokenQueryString;

var _jsonRequest = require("./jsonRequest");

var _jsonRequest2 = _interopRequireDefault(_jsonRequest);

var _contentRequest2 = require("./contentRequest");

var _contentRequest3 = _interopRequireDefault(_contentRequest2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/** OAuth Helper Methods */
function _getOAuthUrl(client_id, redirect_uri, scope, state) {
  var allow_signup = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "true";

  var url = 'https://github.com/login/oauth/authorize';
  var params = {
    response_type: "token",
    client_id: client_id,
    scope: scope,
    state: state,
    allow_signup: allow_signup
  };
  if (redirect_uri) params.redirect_uri = redirect_uri;
  var path = url + "?" + Object.keys(params).map(function (k) {
    return k + "=" + params[k];
  }).join("&");
  return path;
}
/** Request Token by opening a new window for the OAuth authorization */
exports.getOAuthUrl = _getOAuthUrl;
function requestAccessToken(client_id, redirect_uri, scope, state, allow_signup) {
  var path = _getOAuthUrl(client_id, redirect_uri, scope, state, allow_signup);
  window.open(path, "Connect To GitHub", "");
  return path;
}

// not tested
/* parse the oauth redirect url to get the accessToken */
function parseTokenQueryString() {
  "use strict";

  var href = window.location.href;
  if (href.split('?').length < 2) throw Error("url is missing the query.");
  var objectLiteral = '{"' + href.split("?")[1].replace(/&/g, '","').replace(/=/g, '":"') + '"}';

  var _JSON$parse = JSON.parse(objectLiteral),
      code = _JSON$parse.code,
      state = _JSON$parse.state,
      scope = _JSON$parse.scope;

  return {
    href: href,
    state: state,
    code: code,
    scope: scope
  };
}

/** API methods */

var GitHubApi = function () {
  function GitHubApi(clientId, oauthRedirectUri) {
    _classCallCheck(this, GitHubApi);

    this.clientId = clientId;
    // this.clientSecret = clientSecret;
    this.redirectURI = oauthRedirectUri;
    this.root = 'https://api.github.com';
  }

  _createClass(GitHubApi, [{
    key: "updateAccessToken",
    value: function updateAccessToken(accessToken) {
      var tokenType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "bearer";

      this.accessToken = accessToken;
      this.tokenType = tokenType;
      return this;
    }
  }, {
    key: "getOAuthUrl",
    value: function getOAuthUrl(scope, state, allow_signup) {
      return _getOAuthUrl(this.clientId, this.redirectURI, scope, state, allow_signup);
    }
  }, {
    key: "requestAuth",
    value: function requestAuth(scope, state, allow_signup) {
      return requestAccessToken(this.clientId, this.redirectURI, scope, state, allow_signup);
    }

    /** GitHub OAuth Flow does not support getting `access_token` in the browser:
     * https://github.com/isaacs/github/issues/330
     * need a private server to retrieve the access token.
     */

  }, {
    key: "onRedirect",
    value: function onRedirect() {
      var _this = this;

      var _parseTokenQueryStrin = parseTokenQueryString(),
          code = _parseTokenQueryStrin.code,
          state = _parseTokenQueryStrin.state,
          scope = _parseTokenQueryStrin.scope;
      // request token with code


      return this.getAccessTokenViaCode(code, state).then(function (res) {
        _this.updateAccessToken(res.access_token, res.token_type);
        return {
          accessToken: res.access_token,
          tokenType: res.token_type
        };
      });
    }
  }, {
    key: "request",
    value: function request(method, path, params, data, no_parse) {
      return (0, _jsonRequest2.default)(this.accessToken, this.tokenType, method, this.root + path, params, data, no_parse);
    }
  }, {
    key: "contentRequest",
    value: function contentRequest(method, path, params, data, no_parse) {
      return (0, _contentRequest3.default)(this.accessToken, this.tokenType, method, this.root + path, params, data, no_parse);
    }
  }, {
    key: "getAccessTokenViaCode",
    value: function getAccessTokenViaCode(code) {
      /** Let a web server keep the client_secret and handles this access_token retrieval step.
       * currently, this can not be completed directly in a browser:
       * https://github.com/isaacs/github/issues/330
       * */
      return fetch("http://localhost/gatekeeper/?client_id=" + this.clientId + "code=" + code);
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

  }, {
    key: "listGists",
    value: function listGists(username, since) {
      var path = "/gists";
      if (username) {
        path = "/users/" + username + path;
      }
      if (typeof since == "undefined") {
        return this.request("get", path, null);
      } else {
        return this.request("get", path, null, { since: since });
      }
    }
  }, {
    key: "getGist",
    value: function getGist(id, revision) {
      if (revision) {
        return this.request("get", "/gists/" + id + '/' + revision);
      } else {
        return this.request("get", "/gists/" + id);
      }
    }
  }, {
    key: "createGist",
    value: function createGist(files, description) {
      var is_public = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      return this.request("post", "/gists", null, { files: files, description: description, public: is_public });
    }
  }, {
    key: "updateGist",
    value: function updateGist(id, files, description) {
      var data = { files: files };
      if (description) data.description = description;
      return this.request("patch", "/gists/" + id, null, data);
    }

    // backlog: listGistCommits
    // backlog: listGistForks
    // backlog: fortGist

  }, {
    key: "deleteGist",
    value: function deleteGist(id) {
      return this.request("delete", "/gists/" + id, null, null, true);
    }

    /** repository content API endpoints */

    // backlog: getDefaultReadme

    /** the same for getting the content of a file and a folder */

  }, {
    key: "getContents",
    value: function getContents(owner, repo, path, ref) {
      path = ref ? path + "/" + ref : path;
      return this.contentRequest("get", "/repos/" + owner + "/" + repo + "/contents" + path);
    }

    /** the only difference between createFile and updateFile is the absence of SHA */

  }, {
    key: "createFile",
    value: function createFile(owner, repo, path, commit_message, content, branch, committer) {
      var data = {
        message: commit_message,
        content: content
      };
      if (branch) data.branch = branch;
      if (committer) data.committer = committer;
      return this.request("put", "/repos/" + owner + "/" + repo + "/contents" + path, null, data);
    }

    /** need to have the sha of file being replaced */

  }, {
    key: "updateFile",
    value: function updateFile(owner, repo, path, commit_message, content, sha, branch, committer) {
      var data = {
        message: commit_message,
        content: content,
        sha: sha
      };
      if (branch) data.branch = branch;
      if (committer) data.committer = committer;
      return this.request("put", "/repos/" + owner + "/" + repo + "/contents" + path, null, data);
    }
  }, {
    key: "deleteFile",
    value: function deleteFile(owner, repo, path, commit_message, sha, branch, committer) {
      var data = {
        message: commit_message,
        sha: sha
      };
      if (branch) data.branch = branch;
      if (committer) data.committer = committer;
      return this.request("delete", "/repos/" + owner + "/" + repo + "/contents" + path, null, data, true);
    }

    /** get archive link, always returns 302 code */

  }, {
    key: "getFileArchive",
    value: function getFileArchive(owner, repo, path, archive_format, ref) {
      return this.contentRequest("get", "/repos/" + owner + "/" + repo + "/" + archive_format + "/" + ref);
    }
  }, {
    key: "listRepos",
    value: function listRepos(username) {
      return this.request("get", "/users/" + username + "/repos", null, null, false);
    }
  }, {
    key: "listFile",
    value: function listFile(username, repo, path) {
      return this.request("get", "/repos/" + username + "/" + repo + "/contents/" + path, null, null, false);
    }
  }]);

  return GitHubApi;
}();

exports.default = GitHubApi;
;