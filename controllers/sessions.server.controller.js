var Session = require('mongoose').model('Session'),
	security = require('../utils/security.server.utils');

exports.createSession = function(res, req, next) {
	var sessionId = security.genHmac(security.genRandomString(), req.body._id);
	var session = new Session({ _id: sessionId, user: req.body._id });

	session.save(function(err) {
		if (err) {
			return next(err);
		}

		delete session.user;
		delete session.lastUsed;

		res.json(session);
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
		if (err) {
			return next(err);
		}

		req.session = session;
		next();
	});
};