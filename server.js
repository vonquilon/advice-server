var configStr = require('./utils/config.strings');

process.env.NODE_ENV = process.env.NODE_ENV || configStr.env.dev;

var mongoose = require('./config/mongoose'),
	express = require('./config/express');

var db = mongoose();
var app = express();
var port = 3000;

if (process.env.NODE_ENV === configStr.env.test) {
    console.log(configStr.env.test + ' server running at http://localhost:' + port + '/');
} else if (process.env.NODE_ENV === configStr.env.dev) {
    console.log(configStr.env.dev + ' server running at http://localhost:' + (port = 3001) + '/');
} else if (process.env.NODE_ENV === configStr.env.prod) {
    console.log(configStr.env.prod + ' server running at https://localhost:' + port + '/');
}

app.listen(port);

module.exports = {
	server: app,
	db: db,
	close: function(cb) {
		app.close(function() {
			db.disconnect(function() {
				cb();
			});
		});
	}
};