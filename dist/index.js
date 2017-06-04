"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DropboxAPI = exports.GitHubAPI = undefined;

var _githubApi = require("./github/github-api");

var _githubApi2 = _interopRequireDefault(_githubApi);

var _dropboxApi = require("./dropbox/dropbox-api");

var _dropboxApi2 = _interopRequireDefault(_dropboxApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.GitHubAPI = _githubApi2.default;
exports.DropboxAPI = _dropboxApi2.default;