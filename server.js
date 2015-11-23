var configStr = require('./utils/config.strings');

process.env.NODE_ENV = process.env.NODE_ENV || configStr.env.dev;

console.log('NODE_ENV --> ' + process.env.NODE_ENV);

var mongoose = require('./config/mongoose'),
	express = require('./config/express');

var db = mongoose();
var app = express();
var port = 3000;

if (process.env.NODE_ENV === configStr.env.test) {
    console.log('Server running at http://localhost:' + port + '/');
} else if (process.env.NODE_ENV === configStr.env.dev) {
    console.log('Server running at http://localhost:' + (port = 3001) + '/');
} else if (process.env.NODE_ENV === configStr.env.prod) {
    console.log('Server running at https://localhost:' + port + '/');
}

app.listen(port);

module.exports = app;