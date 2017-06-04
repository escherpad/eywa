# Eywa
A collection of javascript drivers for varies of web services.

Implemented following the API V2 http documentation here:
https://www.dropbox.com/developers/documentation/http/documentation

## Usage

### Dropbox

Before you can use this, you need to first setup a test app on Dropbox, and generate an
access token for test.

Two helper functions are included to help with the OAuth2 process:
- `requestAccessToken`: a function that opens a new browser window for the Authorization.
- `parseTokenQueryString`: a parser that makes it easy to parse the parameters in the
redirect url.

After you have done these, you can use `eywa-dropbox` as below:

```javascript
import DropboxApi, {requestAccessToken, parseTokenQueryString} from "eywa-dropbox";

var dp = new Dropbox(clientId, redirectURI)
// you can either set the `accessToken` by:
dp.updateAccessToken(accessToken);
// or use the Redirect method to parse the token from the redirect url.
dp.onRedirect(state);

// To triger the OAuth process, just call: (state is optional)
dp.requestAuth(state);

/* simple api methods */
dp.list_files()
dp.getAccountInfo()
dp.list()
dp.createFolder('/test_folder_1')
dp.remove('/test_folder_1')

/* to upload a file */
var mockContent = JSON.stringify({field: "this is working!"});
dp.upload("/file_upload_folder_1/example.json", mockContent);

/* to download a file */
dp.download("/file_upload_folder_1/example.json")
  .then(res=> {
      expect(res.meta).toBeDefined();
      expect(res.content).toBeDefined();
      expect(res.content).toEqual(mockContent);
   })

/* to search for files */
dp.search("you query here", path, start, max_results, mode)
// where mode is one of [filename, filename_and_content, deleted_filename]
```

### Github

```javascript
import GitHubAPI from 'eywa/github';

const clientId="this is your client Id from GitHub";
const accessToken="here is your access token from GitHub";

const gh = new GitHubAPI(clientId);
gh.updateAccessToken(accessToken);


gh.listGists().then(data=>{
    console.log(data) // this should give your a list of gitsts.
})
// etc.
```

## Develop

## Install Babel, Karma etc globally
if you haven't done so:
```bash
npm install -g babel-cli, karma
```

### setting up OAuth credentials

The credentials are setup inside `./test.config.js`. You can make a copy of the `./test.config.js.example` and start from there.

### Using Karma

To test, run karma. I'm using `webstorm`'s karma integration to run the tests.
**Alternatively**, you can do: 

```shell
# in shell session A
npm run karma-start

# then in shell session B
npm run test
```

### Why Test Across Browsers?

During development, it is important to test across major browser vendors, because some of
the transport configurations are browser specific. For example, Chrome handles CORS headers
differently from Safari despite that they are both webkit.

However, if you set Karma to use three browsers, the test might conflict with each other.
I haven't updated the test to support simultaneous test (with multiple browsers) yet, so
for now you should manually change the karma config file to go through different browsers
manually.

