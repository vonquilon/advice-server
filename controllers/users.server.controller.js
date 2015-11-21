var User = require('mongoose').model('User'),
	errHandler = require('../utils/errHandler'),
	strings = require('../utils/strings');

exports.create = function(req, res) {
	var user = new User(req.body);

	user.provider = 'local';

	user.genAccTokAndSave(function(err) {
		errHandler.handleErr(err, res, function() {
			res.status(201).json(user.clean());
		});
	});
};

exports.signin = function(req, res) {
	User.findByUsername(req.get(strings.headerNames.username), function(err, user) {
		errHandler.handleErr(err, res, function() {
			if (!user) {
				res.status(404).send(strings.statCode._404.unknownUsrNam);
			} else if (!user.authenticate(req.get(strings.headerNames.password))) {
				res.status(401).send(strings.statCode._401.wrongPassword);
			} else {
				user.genAccTokAndSave({validateBeforeSave: false}, function(err) {
					errHandler.handleErr(err, res, function() {
						res.status(200).json(user.clean());
					});
				});
			}
		});
	});
};

exports.signout = function(req, res) {
	User.findById(req.body._id, function(err, user) {
		errHandler.handleErr(err, res, function() {
            if (user && user.validateAccTok(req.body.accessToken)) {
                user.genAccTokAndSave(true, {validateBeforeSave: false}, function(err) {
                    errHandler.handleErr(err, res, function() {
                        res.status(204).end();
                    });
                });
            } else {
                res.status(401).send(strings.statCode._401.unauthAcc);
            }
		});
	});
};

exports.getUserInfo = function(req, res) {
	if (req.query.username) {
		User.findByUsername(req.query.username, 'email username created', function(err, user) {
			errHandler.handleErr(err, res, function() {
				if (user) {
					res.status(200).json(user);
				} else {
					res.status(404).send(strings.statCode._404.unknownUsrNam);
				}
			});
		});
	} else if (req.get(strings.headerNames.userId)) {
		User.findById(req.get(strings.headerNames.userId), 'role accessToken', function(err, user) {
			errHandler.handleErr(err, res, function() {
				if (user && user.validateAccTok(req.get(strings.headerNames.accessToken)) && user.isAdmin()) {
	                User.find({}, function (err, users) {
	                    errHandler.handleErr(err, res, function() {
	                    	res.status(200).json(users);
	                    });
	                });
	            } else {
	                res.status(401).send(strings.statCode._401.unauthAcc);
	            }
			});
		});
	} else {
		res.status(400).send(strings.statCode._400.invalidQueryParam);
	}
};

exports.userById = function(req, res, next, id) {
	User.findById(id, function(err, user) {
		errHandler.handleErr(err, res, function() {
			req.user = user;
			next();
		});
	});
};

exports.update = function(req, res) {
	if (req.user && req.user.validateAccTok(req.get(strings.headerNames.accessToken))) {
		var paths = [];

		for (var key in req.body) {
			if (req.body.hasOwnProperty(key)) {
				switch(key) {
					case 'password':
						req.user.salt = '';
					case 'email':
						req.user[key] = req.body[key];
						paths.push(key);
				}
			}
		}

		if (paths.length > 0) {
			errHandler.handleErr(req.user.validateSync(paths), res, function() {
            	req.user.save({validateBeforeSave: false}, function(err) {
            		errHandler.handleErr(err, res, function() {
            			res.status(201).json(req.user.clean());
            		});
            	});
            });
		} else {
			res.status(403).send(strings.statCode._403.forbiddenOp);
		}
	} else {
		res.status(401).send(strings.statCode._401.unauthAcc);
	}
};

exports.delete = function(req, res) {
    if (req.user && req.user.validateAccTok(req.get(strings.headerNames.accessToken))) {
        req.user.remove(function(err) {
            errHandler.handleErr(err, res, function() {
                res.status(204).end();
            });
        });
    } else {
        res.status(401).send(strings.statCode._401.unauthAcc);
    }
};