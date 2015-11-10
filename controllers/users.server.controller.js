var User = require('mongoose').model('User'),
	errHandler = require('../utils/errHandler'),
	duplicateMsg = 'Username already exists';

exports.create = function(req, res) {
	var user = new User(req.body);

	user.provider = 'local';

	user.genAccTokAndSave(function(err) {
		errHandler.handleErr(duplicateMsg, err, res);
				
		res.status(201).json(user.clean());
	});
};

exports.signin = function(req, res) {
	User.findByUsername(req.body.username, '_id email username created accessToken', function(err, user) {
		errHandler.handleErr(undefined, err, res);

		if (!user) {
			res.status(404).send('Unknown username');
		}
		if (!user.authenticate(req.body.password)) {
			res.status(401).send('Wrong password');
		}

		user.genAccTokAndSave(function(err) {
			errHandler.handleErr(undefined, err, res);

			res.status(200).json(user);
		});
	});
};

exports.getUserInfo = function(req, res) {
	if (req.query.username) {
		User.findByUsername(req.query.username, 'email username created', function(err, user) {
			errHandler.handleErr(duplicateMsg, err, res);

			res.status(200).json(user);
		});
	} else if(req.query.accessToken && req.query.userId) {
		User.findById(req.query.userId, 'role accessToken', function(err, user) {
			errHandler.handleErr(undefined, err, res);

            if (user.validateAccTok(query.accessToken) && user.isAdmin()) {
                User.find({}, function (err, users) {
                    errHandler.handleErr(undefined, err, res);

                    res.status(200).json(users);
                });
            } else {
                res.status(401).send('Unauthorized operation');
            }
		});
	} else {
		res.status(400).send('Invalid query parameter');
	}
};

exports.userById = function(req, res, next, id) {
	User.findById(id, function(err, user) {
		errHandler.handleErr(undefined, err, res);

		req.user = user;
		next();
	});
};

exports.update = function(req, res) {
	var updated = false;

	for (var key in req.body) {
		if (req.body.hasOwnProperty(key)) {
			switch(key) {
				case 'email':
				case 'password':
					req.user[key] = req.body[key];
					updated = true;
			}
		}
	}

	if (updated) {
		req.user.save(function(err) {
			errHandler.handleErr(undefined, err, res);

			res.status(201).json(req.user.clean());
		});
	} else {
		res.status(403).send('Forbidden operation');
	}
};