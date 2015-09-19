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

		res.json(user);
	});
};

exports.signout = function(req, res) {
	req.logout();
};

exports.getUser = function(req, res, next) {
	var user = req.user;
	user.key = hash.genHmac(user.key, user.email, user.username, Date.now().toString(), hash.genRandomString());

	user.save(function(err) {
		if (err) {
			return next(err);
		}

		res.json(user);
	});
};

exports.findUserById = function(req, res, next, id) {
	User.findById(id, 'email username created key', function(err, user) {
		if (err) {
			return next(err);
		}

		req.user = user;
	});
};

exports.list = function(req, res, next) {
	User.find({}, function(err, users) {
		if (err) {
			return next(err);
		}
		
		res.json(users);
	});
};