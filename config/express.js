var config = require('./config'),
	https = require('https'),
	fs = require('fs'),
	express = require('express'),
	morgan = require('morgan'),
	compress = require('compression'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	session = require('express-session');

module.exports = function() {
	var app = express();
    var server = https.createServer({
        key: fs.readFileSync('./config/certs/advc.key'),
        cert: fs.readFileSync('./config/certs/advc.crt'),
        passphrase: 'iSp00nyou'
    }, app);

	if (process.env.NODE_ENV === 'development') {
		app.use(morgan('dev'));
	} else if (process.env.NODE_ENV === 'production') {
		app.use(compress());
	}

	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());

	app.use(session({
		saveUninitialized: true,
		resave: true,
		secret: config.sessionSecret
	}));
	
	require('../routes/index.server.routes.js')(app);
	require('../routes/users.server.routes.js')(app);
	require('../routes/posts.server.routes.js')(app);
	require('../routes/sessions.server.routes.js')(app);

	app.use(express.static('./public'));

	return server;
};