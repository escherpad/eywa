"use strict";

var _githubApi = require("./github-api");

var _githubApi2 = _interopRequireDefault(_githubApi);

var _testConfig = require("../../test.config.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe("gist operations", function () {
  "use strict";

  var gh = new _githubApi2.default(_testConfig.githubClientId);
  gh.updateAccessToken(_testConfig.githubAccessToken);

  it("can list all gists of current user", function (done) {
    // without specifying username, query the current user.
    gh.listGists().then(function (data) {
      console.log(data);
      done();
    });
  });

  it("can list all gists of particular user", function (done) {
    // without specifying username, query the current user.
    gh.listGists('episodeyang').then(function (data) {
      console.log(data);
      done();
    });
  });

  var history = void 0;
  it("can get gist by id", function (done) {
    // without specifying username, query the current user.
    gh.getGist('05e5361bc727ba74d8d927e9f6530a7c').then(function (data) {
      console.log(data);
      history = data.history;
      expect(data.history).toBeDefined();
      done();
    });
  });

  it("can get gist by id and revision", function (done) {
    // without specifying username, query the current user.
    gh.getGist('05e5361bc727ba74d8d927e9f6530a7c', history[3].version).then(function (data) {
      console.log(data);
      done();
    });
  });

  var new_gist_id = void 0;
  it("create a gist", function (done) {
    // without specifying username, query the current user.
    var files = {
      "test_file_1.md": { content: "#test file 1\nThis is the content of test file 1." },
      "test_file_2.md": { content: "#test file 2\nThis is the content of test file 2." }
    };
    var description = "a test gits for `eywa` github driver";
    gh.createGist(files, description, true).then(function (data) {
      console.log(data);
      expect(data.id).toBeDefined();
      new_gist_id = data.id;
      done();
    });
  });

  it("edit a gist", function (done) {
    // without specifying username, query the current user.
    var files = {
      "test_file_1.md": null,
      "test_file_2.md": { content: "#test file 2\nThis is the content of test file 2." }
    };
    var description = "update this description";
    gh.updateGist(new_gist_id, files, description).then(function (data) {
      console.log(data);
      done();
    });
  });

  it("delete a gist", function (done) {
    // without specifying username, query the current user.
    gh.deleteGist(new_gist_id).then(function (data) {
      done();
    });
  });
});

// all of the tests below require OAuth to work.


describe("repository operations", function () {
  "use strict";

  var gh = new _githubApi2.default(_testConfig.githubClientId);
  gh.updateAccessToken(_testConfig.githubAccessToken);

  xit("can get account information", function (done) {
    // dp.getAccountInfo().then(data=> {
    //   expect(data.email).toBeDefined();
    //   expect(data.account_id).toBeDefined();
    //   console.log(data);
    //   done();
    // })
  });

  it("can get README.md file from root", function (done) {
    gh.getContents('episodeyang', 'eywa-github', '/README.md').then(function (data) {
      // console.log(data);
      done();
    });
  });

  var sha = void 0;
  it("create new file in repository", function (done) {
    gh.createFile(_testConfig.testGithubUsername, _testConfig.testRepoName, '/test_folder/test_file.md', "test commit from eywa-github driver, create file", "IyBFeXdhLUdpdEh1YiBUZXN0IEZpbGUNCg0KLSB0aGlzIHdvcmtzIQ0KLSB0aGlzIHdvcmtzISEh").then(function (data) {
      expect(data.content.sha).toBeDefined();
      sha = data.content.sha;
      done();
    });
  });

  // note: might have a race condition with the create and delete function.
  it("update file in repository", function (done) {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 2000;
    gh.updateFile(_testConfig.testGithubUsername, _testConfig.testRepoName, '/test_folder/test_file.md', "test commit from eywa-github driver, update file", "IyBFeXdhLUdpdEh1YiBUZXN0IEZpbGUNCg0KLSB0aGlzIHdvcmtzIQ0KLSB0aGlzIHdvcmtzISEhDQoNClRoaXMgaXMgYWRkZWQgYnkgdGhlIGZpbGUgdXBkYXRlIGNvbW1hbmQuDQoNCi0gR2UgWWFuZw==", sha).then(function (data) {
      expect(data.content.sha).toBeDefined();
      sha = data.content.sha;
      done();
    });
  });
  it("delete file in repository", function (done) {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 2000;
    gh.deleteFile(_testConfig.testGithubUsername, _testConfig.testRepoName, '/test_folder/test_file.md', "test commit from eywa-github driver, delete file", sha).then(function (res) {
      if (res.ok) {
        done();
      } else {
        throw Error('delete failed');
      }
    });
  });

  it("list repo of given owner", function (done) {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 2000;
    gh.listRepos(_testConfig.testGithubUsername).then(function (data) {
      expect(data.length > 0).toBe(true);
      expect(data[0].id).toBeDefined();
      done();
    });
  }

  // use my homepage
  );var path = "/";
  it("list file in public repo", function (done) {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 2000;
    gh.listFile(_testConfig.testGithubUsername, _testConfig.testPublickRepo, path).then(function (data) {
      expect(data.length > 0).toBe(true);
      expect(data[0].type).toBeDefined();
      done();
    });
  });

  it("list file in private repo", function (done) {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 2000;
    gh.listFile(_testConfig.testGithubUsername, _testConfig.testPrivateRepo, path).then(function (data) {
      expect(data.length > 0).toBe(true);
      expect(data[0].type).toBeDefined();
      done();
    });
  });
});