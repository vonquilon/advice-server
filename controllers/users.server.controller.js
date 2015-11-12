var User = require('mongoose').model('User'),
	errHandler = require('../utils/errHandler'),
	messages = require('../utils/messages');

exports.create = function(req, res) {
	var user = new User(req.body);

	user.provider = 'local';

	user.genAccTokAndSave(function(err) {
		errHandler.handleErr(err, res, function() {
			console.log(user);
			res.status(201).json(user.clean());
		}, messages._409.usernameDuplicateMsg);
	});
};

exports.signin = function(req, res) {
	User.findByUsername(req.body.username, '_id email username created accessToken', function(err, user) {
		errHandler.handleErr(err, res);

		if (!user) {
			res.status(404).send(messages._404.unknownUsrNam);
		}
		if (!user.authenticate(req.body.password)) {
			res.status(401).send(messages._401.wrongPassword);
		}

		user.genAccTokAndSave(function(err) {
			errHandler.handleErr(err, res);

			res.status(200).json(user);
		});
	});
};

exports.signout = function(req, res) {
	User.findById(req.body._id, function(err, user) {
		errHandler.handleErr(err, res);

		if (user && user.validateAccTok(req.body.accessToken)) {
			user.resetAccTokAndSave(function(err) {
				errHandler.handleErr(err, res);

				res.status(204).end();
			});
		} else {
			res.status(401).send(messages._401.unauthAcc);
		}
	});
};

exports.getUserInfo = function(req, res) {
	if (req.query.username) {
		User.findByUsername(req.query.username, 'email username created', function(err, user) {
			errHandler.handleErr(err, res);

			if (user) {
				res.status(200).json(user);
			} else {
				res.status(404).send(messages._404.unknownUsrNam);
			}
		});
	} else if(req.query.userId) {
		User.findById(req.query.userId, 'role accessToken', function(err, user) {
			errHandler.handleErr(err, res);

            if (user && user.validateAccTok(query.accessToken) && user.isAdmin()) {
                User.find({}, function (err, users) {
                    errHandler.handleErr(err, res);

                    res.status(200).json(users);
                });
            } else {
                res.status(401).send(messages._401.unauthAcc);
            }
		});
	} else {
		res.status(400).send(messages._400.invalidQueryParam);
	}
};

exports.userById = function(req, res, next, id) {
	User.findById(id, function(err, user) {
		errHandler.handleErr(err, res);

		req.user = user;
		next();
	});
};

exports.update = function(req, res) {
	if (req.user && req.user.validateAccTok(req.query.accessToken)) {
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
				errHandler.handleErr(err, res);

				res.status(201).json(req.user.clean());
			});
		} else {
			res.status(403).send(messages._403.forbiddenOp);
		}
	} else {
		res.status(401).send(messages._401.unauthAcc);
	}
};

exports.delete = function(req, res) {
    if (req.user && req.user.validateAccTok(req.query.accessToken)) {
        req.user.remove(function(err) {
            errHandler.handleErr(err, res);

            res.status(204).end();
        });
    } else {
        res.status(401).send(messages._401.unauthAcc);
    }
};