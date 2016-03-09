var Session = require('mongoose').model('Session'),
	errHandler = require('../utils/errHandler'),
	strings = require('../utils/strings');

exports.createSession = function(req, res) {
	if (req.body.lastUsed) {
		req.body.lastUsed = undefined;
	}

	var session = new Session(req.body);

	session.save(function(err) {
		errHandler.handleErr(err, res, function() {
			res.status(201).json(session.clean());
		});
	});
};

exports.getSession = function(req, res) {
	if (req.session) {
		var session = req.session;
		session.lastUsed = Date.now();

		session.save(function (err) {
			errHandler.handleErr(err, res, function() {
				session.user.genAccTokAndSave({validateBeforeSave: false}, function(err) {
					errHandler.handleErr(err, res, function() {
						res.status(200).json(session.user.clean());
					});
				});
			});
		});
	} else {
		res.status(404).send(strings.statCode._404.sessionNotFound);
	}
};

exports.deleteSession = function(req, res, next) {
	req.session.remove(function(err) {
		if (err) {
			return next(err);
		}

		// TODO: res.send or res.json?
	});
};

exports.findSessionById = function(req, res, next, id) {
	Session.findById(id)
		.populate('user')
		.exec(function(err, session) {
			errHandler.handleErr(err, res, function() {
				req.session = session;
				next();
			});
		});
};