"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = jsonRequest;

require("whatwg-fetch");

function jsonRequest(access_token, token_type) {
  "use strict";

  var method = arguments.length <= 2 || arguments[2] === undefined ? "get" : arguments[2];
  var url = arguments[3];
  var params = arguments[4];
  var data = arguments.length <= 5 || arguments[5] === undefined ? null : arguments[5];
  var no_parse = arguments.length <= 6 || arguments[6] === undefined ? false : arguments[6];
  if (!params) params = {};
  var paramString = Object.keys(params).map(function (key) {
    return key + "=" + params[key];
  }).join('&');
  var option = {
    method: method.toUpperCase(),
    headers: {
      Authorization: token_type + " " + access_token,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json; charset=utf-8"
    }
  };
  if (data) option.body = JSON.stringify(data);
  return fetch(url + "?" + paramString, option).then(function (res) {
    return no_parse ? res : res.json();
  });
} /** Created by ge on 6/11/16. */