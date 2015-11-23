var configStr = require('./utils/config.strings');

process.env.NODE_ENV = process.env.NODE_ENV || configStr.env.dev;

var mongoose = require('./config/mongoose'),
	express = require('./config/express'),
    port = 3000;

var db = mongoose();
var app = express();

app.listen(port);

module.exports = app;

if (process.env.NODE_ENV === configStr.env.dev || process.env.NODE_ENV === configStr.env.test) {
    console.log('Server running at http://localhost:' + port + '/');
} else if (process.env.NODE_ENV === configStr.env.prod) {
    console.log('Server running at https://localhost:' + port + '/');
}