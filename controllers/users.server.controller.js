var User = require('mongoose').model('User'),
	errHandler = require('../utils/errHandler'),
	duplicateMsg = 'Username already exists';

exports.create = function(req, res, next) {
	var user = new User(req.body);

	user.provider = 'local';

	user.save(function(err) {
		if (err) {
			res.status(500).send(errHandler.getErrMsg(duplicateMsg, err));
		}

		delete user.role;
		delete user.provider;
		delete user.salt;
				
		res.json(user);
	});
};

exports.signin = function(req, res, next) {
	User.findOne({ username: req.body.username }, '_id email username created', function(err, user) {
		if (err) {
			return next(err);
		}
		if (!user) {
			return next(new Error('Unknown username'));
		}
		if (!user.authenticate(req.body.password)) {
			return next(new Error('Wrong password'));
		}

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