/** Created by ge on 2/17/17. */
import GitHubApi, {parseTokenQueryString} from "../src/github/github-api.js";
import {githubClientId, githubClientSecret} from '../test.config';
window.GitHubApi = GitHubApi;
console.log('demo script has loaded successfully.');

window.dropboxOnClick = function () {
  console.log('dropbox onClick')
};
const redirect_uri = undefined;
let ghapi = new GitHubApi(githubClientId, githubClientSecret, redirect_uri);
const scope = "repo, gist";

window.githubOnClick = function () {
  ghapi.requestAuth(scope, 'github_oauth_state', true)
};

document.body.onload = () => {
  if (window.location.search.match('state=github_oauth_state')) {
    ghapi.onRedirect().then(({accessToken, tokenType}) => {
      alert(tokenType + " " + accessToken);
    });
  }
};
