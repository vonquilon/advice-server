var mongoose = require('mongoose'),
    Post = mongoose.model('Post'),
    User = mongoose.model('User'),
    errHandler = require('../utils/errHandler'),
    strings = require('../utils/strings');

exports.create = function(req, res) {
    User.findById(req.body.author, function(err, user) {
        errHandler.handleErr(err, res, function() {
            if (user && user.validateAccTok(req.body.accessToken)) {
                console.log(req.body);
                delete req.body.accessToken;
                console.log(req.body);

                var post = new Post(req.body);
                post.save(function(err) {
                    errHandler.handleErr(err, res, function() {
                        res.status(201).json(post);
                    });
                });
            } else {
                res.status(401).send(strings.statCode._401.unauthAcc);
            }
        });
    });
};