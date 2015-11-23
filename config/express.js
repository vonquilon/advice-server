var express = require('express'),
	morgan = require('morgan'),
	compress = require('compression'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
    configStr = require('../utils/config.strings');

module.exports = function() {
	var app = express(),
		server;

	if (process.env.NODE_ENV === configStr.env.dev || process.env.NODE_ENV === configStr.env.test) {
        server = require('http').createServer(app);
		app.use(morgan('dev'));
	} else if (process.env.NODE_ENV === configStr.env.prod) {
        var fs = fs = require('fs');
        server = require('https').createServer({
            key: fs.readFileSync('./config/certs/advc.key'),
            cert: fs.readFileSync('./config/certs/advc.crt'),
            passphrase: 'iSp00nyou'
        }, app);
		app.use(compress());
	}

	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());
	
	require('../routes/index.server.routes.js')(app);
	require('../routes/users.server.routes.js')(app);
	require('../routes/posts.server.routes.js')(app);
	require('../routes/sessions.server.routes.js')(app);

	app.use(express.static('./public'));

	return server;
};