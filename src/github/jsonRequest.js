/** Created by ge on 6/11/16. */
import "whatwg-fetch";

"use strict";
export default function jsonRequest(access_token, token_type, method = "get", url, params, data = null, no_parse = false) {

  if (!params) params = {};
  let paramString = Object.keys(params).map(key => {
    return key + "=" + params[key]
  }).join('&');
  let option = {
    method: method.toUpperCase(),
    headers: {
      Authorization: token_type + " " + access_token,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json; charset=utf-8"
    },
  };
  if (data) option.body = JSON.stringify(data);
  return fetch(url + "?" + paramString, option)
      .then(response => {
          if (!response.ok) {
              throw Error(response.statusText);
          }
          return response
      }).then(res => no_parse ? res : res.json())
}
