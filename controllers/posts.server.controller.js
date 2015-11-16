var mongoose = require('mongoose'),
    Post = mongoose.model('Post'),
    User = mongoose.model('User'),
    errHandler = require('../utils/errHandler'),
    strings = require('../utils/strings');

exports.createPost = function(req, res) {
    if (req.query.accessToken && req.query.userId) {
        User.findById(req.query.userId, 'accessToken', function(err, user) {
            errHandler.handleErr(err, res);

            if (!user || !user.validateAccTok(req.query.accessToken)) {
                res.status(401).send(strings.statCode._401.unauthAcc);
            }

            var post = new Post(req.body);

            post.save(function(err) {
                errHandler.handleErr(err, res, duplicateMsg);

                res.status(201).json(post);
            });
        });
    } else {
        res.status(400).send(strings.statCode._400.invalidQueryParam);
    }
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