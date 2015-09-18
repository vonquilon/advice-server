var Session = require('mongoose').model('Session'),
	hash = require('../utils/hash.server.utils');

exports.getSession = function(req, res, next) {
	Session.findById(req.body.sessionId)
		.populate('user', 'email username created key')
		.exec(function(err, session) {
			if (err) {
				return next(err);
			}

			var user = session.user;
			user.key = hash.genHmac(user.key, user.email, user.username, Date.now().toString(), hash.genRandomString());

			user.save(function(err) {
				if (err) {
					return next(err);
				}

				user.sessionId = hash.genHmac(user.key, hash.genRandomString());
				session.update({ $set: {_id: user.sessionId, lastUsed: Date.now} }, function(err) {
					if (err) {
						return next(err);
					}

					res.json(user);
				});
			});		
		});
};

// TODO: put delete session here?