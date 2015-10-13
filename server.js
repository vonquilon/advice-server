process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var mongoose = require('./config/mongoose'),
	express = require('./config/express'),
	fs = require('fs'),
	https = require('https');

var db = mongoose();
var app = express();

https.createServer({
	key: fs.readFileSync('./certs/advc.key'),
	cert: fs.readFileSync('./certs/advc.crt')
}, app).listen(3000);

module.exports = app;

console.log('Server running at https://localhost:3000/');