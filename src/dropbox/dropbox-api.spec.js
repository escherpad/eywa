/** Created by ge on 6/7/16. */
import DropboxApi, {requestAccessToken, parseTokenQueryString} from "./dropbox-api.js";

// all of the tests below require OAuth to work.
import {dropboxClientId as clientId, dropboxAccessToken as accessToken} from "../../test.config.js";

describe("file operations", function () {
  "use strict";
  var dp = new DropboxApi(clientId);
  dp.updateAccessToken(accessToken);

  it("can get account information", function (done) {
    dp.getAccountInfo().then(data=> {
      expect(data.email).toBeDefined();
      expect(data.account_id).toBeDefined();
      console.log(data);
      done();
    })
  });

  it("can list folders", function (done) {
    dp.list().then(data=> {
      console.log(data);
      done();
    });
  });

  var folder_id;
  it("can create a new folder", function (done) {
    dp.createFolder('/test_folder_1').then(data=> {
      console.log(data);
      expect(data.id).toBeDefined();
      folder_id = data.id;
      done();
    });
  });

  it("can remove a folder", function (done) {
    dp.remove('/test_folder_1').then(data=> {
      console.log(data);
      expect(data.name).toBeDefined();
      done();
    });
  });

  it("can search for existing files", function (done) {
    dp.search('.json').then(data=> {
      console.log(data);
      done()
    })
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

describe("content api", function () {

  var dp, folder_id;
  beforeAll(function (done) {
    dp = new DropboxApi(clientId);
    dp.updateAccessToken(accessToken);
    dp.remove('/file_upload_folder_1/example.json').then(()=> {
      dp.createFolder('/file_upload_folder_1').then(data=> done());
    }
        );
  });

  var mockContent = JSON.stringify({field: "this is working!"});
  it("can upload file", function (done) {
    dp.upload(
      "/file_upload_folder_1/example.json",
      mockContent
    ).then(res=> {
      console.log(res);
      done();
    })
  });
  it("can download the file, and content should be correct", function (done) {
    dp.download(
      "/file_upload_folder_1/example.json"
    ).then(res=> {
      // todo: need to add error handling
      expect(res.metadata).toBeDefined();
      expect(res.content).toBeDefined();
      expect(res.content).toEqual(mockContent);
      done();
    })
  });
});
