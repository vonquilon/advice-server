var User = require('mongoose').model('User'),
	errHandler = require('../utils/errHandler'),
	duplicateMsg = 'Username already exists';

exports.create = function(req, res, next) {
	var user = new User(req.body);

	user.provider = 'local';

	user.save(function(err) {
		if (err) {
			var errMsg = errHandler.getErrMsg(duplicateMsg, err);
			res.status(errMsg.statCode).send(errMsg.msg);
		}

		delete user.role;
		delete user.provider;
		delete user.salt;
				
		res.status(201).json(user);
	});
};

exports.signin = function(req, res, next) {
	User.findOne({ username: req.body.username }, '_id email username created', function(err, user) {
		if (err) {
			var errMsg = errHandler.getErrMsg(duplicateMsg, err);
			res.status(errMsg.statCode).send(errMsg.msg);
		}
		if (!user) {
			res.status(404).send('Unknown username');
		}
		if (!user.authenticate(req.body.password)) {
			res.status(401).send('Wrong password');
		}

		res.status(200).json(user);
	});
};

exports.getUserInfo = function(req, res, next) {
	if (req.query) {
		if (req.query.username) {
			User.find({ username: req.query.username }, 'email username created', function(err, user) {
				if (err) {
					var errMsg = errHandler.getErrMsg(duplicateMsg, err);
					res.status(errMsg.statCode).send(errMsg.msg);
				}

				res.status(200).json(user);
			});
		} else {
			res.status(400).send('Invalid query');
		}
	} else {
		User.find({}, function (err, users) {
			if (err) {
				var errMsg = errHandler.getErrMsg(duplicateMsg, err);
				res.status(errMsg.statCode).send(errMsg.msg);
			}

			res.status(200).json(users);
		});
	}
};