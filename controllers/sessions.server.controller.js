var Session = require('mongoose').model('Session'),
	User = require('mongoose').model('User'),
	errHandler = require('../utils/errHandler'),
	strings = require('../utils/strings');

exports.createSession = function(req, res) {
	User.findById(req.body.user, function(err, user) {
		errHandler.handleErr(err, res, function() {
			if (user && user.validateAccTok(req.body.accessToken)) {
				if (req.body.lastUsed) {
					req.body.lastUsed = undefined;
				}

				var session = new Session(req.body);

				session.save(function(err) {
					errHandler.handleErr(err, res, function() {
						res.status(201).json(session.clean());
					});
				});
			} else {
				res.status(401).send(strings.statCode._401.unauthAcc);
			}
		});
	});
};

exports.getSession = function(req, res) {
	if (req.session) {
		var session = req.session;

		session.lastUsed = Date.now();
		session.save(function (err) {
			errHandler.handleErr(err, res, function () {
				session.user.genAccTokAndSave({validateBeforeSave: false}, function (err) {
					errHandler.handleErr(err, res, function () {
						res.status(200).json(session.user.clean());
					});
				});
			});
		});
	} else {
		res.status(404).send(strings.statCode._404.sessionNotFound);
	}
};

exports.deleteSession = function(req, res) {
	if (req.session) {
		var session = req.session;

		session.remove(function(err) {
			errHandler.handleErr(err, res, function() {
				res.status(204).end();
			});
		});
	} else {
		res.status(404).send(strings.statCode._404.sessionNotFound);
	}
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