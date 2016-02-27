var Session = require('mongoose').model('Session'),
	errHandler = require('../utils/errHandler'),
	strings = require('../utils/strings');

exports.createSession = function(res, req, next) {
	if (req.body.lastUsed) {
		req.body.lastUsed = undefined;
	}

	var session = new Session(req.body);

	session.save(function(err) {
		errHandler.handleErr(err, res);

		res.status(201).json(session.clean());
	});
};

exports.getSession = function(req, res, next) {
	//user.key = security.genHmac(user.key, user.email, user.username, Date.now().toString(), security.genRandomString());
	var session = req.session;
	session._id = security.genHmac(security.genRandomString(), session._id);
	session.lastUsed = Date.now;

	session.save(function(err) {
		if (err) {
			return next(err);
		}

		delete session.lastUsed;

		res.json(session);
	});	
};

exports.deleteSession = function(res, req, next) {
	req.session.remove(function(err) {
		if (err) {
			return next(err);
		}

		// TODO: res.send or res.json?
	});
};

exports.findSessionById = function(res, req, next, id) {
	Session.findById(id, function(err, session) {
		errHandler.handleErr(err, res, function() {
			req.session = session;
			next();
		});
	});
};