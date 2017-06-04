"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = rpcRequest;

require("whatwg-fetch");

"use strict"; /** Created by ge on 6/11/16. */
function rpcRequest(access_token, method, url) {
  var body = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  var params = {};
  params.authorization = "Bearer " + access_token;
  // params.reject_cors_preflight = "true";
  /* for content-upload endpoints, use the params.args field to pass in
   /* a stringified arg payload. */
  var paramString = Object.keys(params).map(function (key) {
    return key + "=" + params[key];
  }).join('&');
  var option = {
    method: method.toUpperCase(),
    headers: {
      Accept: "text/plain; charset=dropbox-cors-hack", // this avoids CORS round trip in Chrome
      /* octet and json works. Safari and FF overwrites charset.
       * Just need to turn off params.reject_cors_preflight.  */
      "Content-Type": "application/json; charset=utf-8"
      // "Content-Type": "text/plain; charset=dropbox-cors-hack"
    },
    body: JSON.stringify(body)
  };
  var queryString = url + "?" + paramString;
  return fetch(queryString, option).then(function (res) {
    return res.json();
  });
}