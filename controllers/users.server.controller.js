var User = require('mongoose').model('User'),
	hash = require('../utils/hash.server.utils');

exports.create = function(req, res, next) {
	var user = new User(req.body);

	user.provider = 'local';
	user.key = hash.genHmac(hash.genRandomString(), user.email, user.username, user.created.toString());

	user.save(function(err) {
		if (err) {
			return next(err);
		}

		delete user.role;
		delete user.provider;
		delete user.salt;
				
		res.json(user);
	});
};

exports.signin = function(req, res, next) {
	User.findOne({ username: req.body.username }, '_id email username created key', function(err, user) {
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

		res.json(user);
	});
};

exports.getUserInfo = function(req, res, next) {
	if (req.query) {
		if (req.query.username) {
			User.find({ username: req.query.username }, 'email username created', function(err, user) {
				if (err) {
					return next(err);
				}

				res.json(user);
			});
		} else if (req.query.action) {
			if (req.query.action === 'nonce') {
				
			}
		} else {
			// Send invalid query error
		}
	} else {
		User.find({}, function (err, users) {
			if (err) {
				return next(err);
			}

			res.json(users);
		});
	}
};