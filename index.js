// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');
var S3Adapter = require('parse-server').S3Adapter;

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://heroku_9f6784v4:2jqhav796q7lvn92t57ab43atm@ds157248.mlab.com:57248/heroku_9f6784v4',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'MGRCcVpPIv0LX1tLlZWA41aNdA5HCdwouewpxYEe',
  fileKey: 'MGRCcVpPIv0LX1tLlZWA41aNdA5HCdwouewpxYEe',
  masterKey: process.env.MASTER_KEY || '9FwBdd5uMaSshRjD0MBKAD9JE3cojNtemBXSDEBU', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'https://clubejohnnie-mobile.herokuapp.com/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  },
  filesAdapter: new S3Adapter(
    process.env.AWS_ACCESS_KEY_ID || "AKIAJ2JUSRZGFZYJDASA",
    process.env.AWS_SECRET_ACCESS_KEY || "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",
    process.env.BUCKET_NAME || "clubejohnnie"
  )
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
