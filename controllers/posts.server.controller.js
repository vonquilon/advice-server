var mongoose = require('mongoose'),
    Post = mongoose.model('Post'),
    User = mongoose.model('User'),
    errHandler = require('../utils/errHandler'),
    strings = require('../utils/strings');

exports.create = function(req, res) {
    User.findById(req.body._id, function(err, user) {
        errHandler.handleErr(err, res, function() {
            if (user && user.validateAccTok(req.body.accessToken)) {
                delete req.body._id;
                delete req.body.accessToken;

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

exports.listPosts = function(req, res) {
    var query,
        sortBy = 'created',
        sortOrder = '-';

    if (req.query.username) {
        query = Post.findPostsByUsername(req.query.username);
    } else {
        query = Post.find().populate({ path: 'author', select: 'username' });
    }

    if (req.query.sortBy) {
        switch (req.query.sortBy) {
            case 'author':
                sortBy = 'author.username';
                break;
        }
    }

    if (req.query.sortOrder) {
        switch (req.query.sortOrder) {
            case 'asc':
            case 'ascending':
                sortOrder = '';
        }
    }

    query.sort(sortOrder + sortBy)
        .exec(function(err, posts) {
            errHandler.handleErr(err, res);

		    res.status(200).json(posts);
	    });
};