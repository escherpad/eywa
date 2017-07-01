import GitHubApi from "./github-api";

// all of the tests below require OAuth to work.
import {githubClientId as clientId,
    githubClientSecret,
    githubAccessToken as accessToken,
   githubClientUsername as username,
   testRepoName} from "../../test.config.js";

describe("gist operations", function () {
  "use strict";

  const gh = new GitHubApi(clientId);
  gh.updateAccessToken(accessToken);

  it("can list all gists of current user", function (done) {
    // without specifying username, query the current user.
    gh.listGists().then(data => {
      console.log(data);
      done();
    });
  });

  it("can list all gists of particular user", function (done) {
    // without specifying username, query the current user.
    gh.listGists('episodeyang').then(data => {
      console.log(data);
      done();
    });
  });

  let history;
  it("can get gist by id", function (done) {
    // without specifying username, query the current user.
    gh.getGist('05e5361bc727ba74d8d927e9f6530a7c').then(data => {
      console.log(data);
      history = data.history;
      expect(data.history).toBeDefined();
      done();
    });
  });

  it("can get gist by id and revision", function (done) {
    // without specifying username, query the current user.
    gh.getGist('05e5361bc727ba74d8d927e9f6530a7c', history[3].version).then(data => {
      console.log(data);
      done();
    });
  });

  let new_gist_id;
  it("create a gist", function (done) {
    // without specifying username, query the current user.
    let files = {
      "test_file_1.md": {content: "#test file 1\nThis is the content of test file 1."},
      "test_file_2.md": {content: "#test file 2\nThis is the content of test file 2."},
    };
    let description = "a test gits for `eywa` github driver";
    gh.createGist(files, description, true).then(data => {
      console.log(data);
      expect(data.id).toBeDefined();
      new_gist_id = data.id;
      done();
    });
  });


  it("edit a gist", function (done) {
    // without specifying username, query the current user.
    let files = {
      "test_file_1.md": null,
      "test_file_2.md": {content: "#test file 2\nThis is the content of test file 2."},
    };
    let description = "update this description";
    gh.updateGist(new_gist_id, files, description).then(data => {
      console.log(data);
      done();
    });
  });

  it("delete a gist", function (done) {
    // without specifying username, query the current user.
    gh.deleteGist(new_gist_id).then(data => {
      done();
    });
  });
});

describe("repository operations", function () {
  "use strict";
  let gh = new GitHubApi(clientId);
  gh.updateAccessToken(accessToken);

  xit("can get account information", function (done) {
    // dp.getAccountInfo().then(data=> {
    //   expect(data.email).toBeDefined();
    //   expect(data.account_id).toBeDefined();
    //   console.log(data);
    //   done();
    // })
  });


  it("can get README.md file from root", function (done) {
    gh.getContents('episodeyang', 'eywa-github', '/README.md').then(data => {
      // console.log(data);
      done()
    });
  });

  let sha;
  it("create new file in repository", function (done) {
    gh.createFile(username, testRepoName,
      '/test_folder/test_file.md',
      "test commit from eywa-github driver, create file",
      "IyBFeXdhLUdpdEh1YiBUZXN0IEZpbGUNCg0KLSB0aGlzIHdvcmtzIQ0KLSB0aGlzIHdvcmtzISEh"
    ).then(data => {
      expect(data.content.sha).toBeDefined();
      sha = data.content.sha;
      done()
    }).catch(error => {
      console.log(error);
      fail()
    });
  });

  // note: might have a race condition with the create and delete function.
  it("update file in repository", function (done) {
    jasmine.DEFAULT_TIMEOUT_INTERVAL= 2000;
    gh.updateFile(username, testRepoName,
      '/test_folder/test_file.md',
      "test commit from eywa-github driver, update file",
      "IyBFeXdhLUdpdEh1YiBUZXN0IEZpbGUNCg0KLSB0aGlzIHdvcmtzIQ0KLSB0aGlzIHdvcmtzISEhDQoNClRoaXMgaXMgYWRkZWQgYnkgdGhlIGZpbGUgdXBkYXRlIGNvbW1hbmQuDQoNCi0gR2UgWWFuZw==",
      sha
    ).then(data => {
      expect(data.content.sha).toBeDefined();
      sha = data.content.sha;
      done()
    }).catch(error => {
      console.log(error);
      fail()
    });
  });

  it("delete file in repository", function(done){
    jasmine.DEFAULT_TIMEOUT_INTERVAL= 2000;
    console.log(sha)
    gh.deleteFile(username, testRepoName,
      '/test_folder/test_file.md',
      "test commit from eywa-github driver, delete file",
      sha
    ).then(data => {
      done()
    }).catch(error => {
      console.log(error);
      fail()
    });
  })


});
