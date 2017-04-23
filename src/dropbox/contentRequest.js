/** Created by ge on 6/11/16. */
export default function contentRequest(access_token, method, url, arg,
                                       content = null) {
  "use strict";
  var params = {};
  if (arg) params.arg = JSON.stringify(arg);
  params.authorization = "Bearer " + access_token;

  var paramString = Object.keys(params).map(key=> {
    return key + "=" + params[key]
  }).join('&');

  var option = {
    method: method.toUpperCase(),
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
