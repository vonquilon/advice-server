var User = require('mongoose').model('User'),
	Session = require('mongoose').model('Session'),
	hash = require('../utils/hash.server.utils');

exports.create = function(req, res, next) {
	var user = new User(req.body);

	user.provider = 'local';
	user.key = hash.genHmac(hash.genRandomString(), user.email, user.username, user.created.toString());

	user.save(function(err) {
		if (err) {
			return next(err);
		}

		if (req.body.sessionId) {
			var sessionId = hash.genHmac(user.key, hash.genRandomString());
			var session = new Session({ _id: sessionId, user: user });

			session.save(function(err) {
				if (err) {
					return next(err);
				}

				delete user.role;
				delete user.provider;
				delete user.salt;
				user.sessionId = sessionId;
				res.json(user);
			});
		} else {
			res.json(user);
		}

		console.log(user);
	});
};

exports.signin = function(req, res, next) {
	User.findOne({ username: req.body.username }, 'email username created key', function(err, user) {
		if (err) {
			return next(err);
		}
		if (!user) {
			return next(new Error('Unknown username'));
		}
		if (!user.authenticate(req.body.password)) {
			return next(new Error('Wrong password'));
		}

		user.key = hash.genHmac(user.key, user.email, user.username, Date.now().toString(), hash.genRandomString());

		if (req.body.sessionId) {
			var sessionId = hash.genHmac(user.key, hash.genRandomString());
			var session = new Session({ _id: sessionId, user: user });

			session.save(function(err) {
				if (err) {
					return next(err);
				}

				user.sessionId = sessionId;
				res.json(user);
			});
		} else {
			res.json(user);
		}
	});
};

exports.signout = function(req, res) {
	req.logout();
};

exports.list = function(req, res, next) {
	User.find({}, function(err, users) {
		if (err) {
			return next(err);
		}
		
		res.json(users);
	});
};