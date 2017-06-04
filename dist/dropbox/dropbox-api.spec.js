"use strict";

var _dropboxApi = require("./dropbox-api.js");

var _dropboxApi2 = _interopRequireDefault(_dropboxApi);

var _testConfig = require("../../test.config.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Created by ge on 6/7/16. */
describe("file operations", function () {
  "use strict";

  var dp = new _dropboxApi2.default(_testConfig.dropboxClientId);
  dp.updateAccessToken(_testConfig.dropboxAccessToken);

  it("can get account information", function (done) {
    dp.getAccountInfo().then(function (data) {
      expect(data.email).toBeDefined();
      expect(data.account_id).toBeDefined();
      console.log(data);
      done();
    });
  });

  it("can list folders", function (done) {
    dp.list().then(function (data) {
      console.log(data);
      done();
    });
  });

  var folder_id;
  it("can create a new folder", function (done) {
    dp.createFolder('/test_folder_1').then(function (data) {
      console.log(data);
      expect(data.id).toBeDefined();
      folder_id = data.id;
      done();
    });
  });

  it("can remove a folder", function (done) {
    dp.remove('/test_folder_1').then(function (data) {
      console.log(data);
      expect(data.name).toBeDefined();
      done();
    });
  });

  it("can search for existing files", function (done) {
    dp.search('.json').then(function (data) {
      console.log(data);
      done();
    });
  });

  // it("can get revisions", function(done){
  //   dp.getRevisions('/test_folder_1').then(data=> {
  //     console.log(data);
  //     done();
  //   });
  // });
  //
  // it("can restore a folder", function(done){
  //   dp.restore('/test_folder_1').then(data=> {
  //     console.log(data);
  //     done();
  //   });
  // });
});

// all of the tests below require OAuth to work.


describe("content api", function () {

  var dp, folder_id;
  beforeAll(function (done) {
    dp = new _dropboxApi2.default(_testConfig.dropboxClientId);
    dp.updateAccessToken(_testConfig.dropboxAccessToken);
    dp.remove('/file_upload_folder_1/example.json').then(function () {
      dp.createFolder('/file_upload_folder_1').then(function (data) {
        return done();
      });
    });
  });

  var mockContent = JSON.stringify({ field: "this is working!" });
  it("can upload file", function (done) {
    dp.upload("/file_upload_folder_1/example.json", mockContent).then(function (res) {
      console.log(res);
      done();
    });
  });
  it("can download the file, and content should be correct", function (done) {
    dp.download("/file_upload_folder_1/example.json").then(function (res) {
      // todo: need to add error handling
      expect(res.metadata).toBeDefined();
      expect(res.content).toBeDefined();
      expect(res.content).toEqual(mockContent);
      done();
    });
  });
});