/** Created by ge on 6/11/16. */

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = contentRequest;
function contentRequest(access_token, method, url, arg) {
  var content = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

  var params = {};
  if (arg) params.arg = JSON.stringify(arg);
  params.authorization = "Bearer " + access_token;

  var paramString = Object.keys(params).map(function (key) {
    return key + "=" + params[key];
  }).join('&');

  var option = {
    method: method.toUpperCase()
  };

  if (content) {
    option.headers = {
      // avoid Dropbox-API-Args to make the XHR "simple"
      "Content-Type": "application/octet-stream"
    };
    option.body = content;
  }

  var queryString = url + "?" + paramString;
  return fetch(queryString, option);
}