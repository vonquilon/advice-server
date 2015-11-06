var mongoose = require('mongoose'),
    Post = mongoose.model('Post'),
    User = mongoose.model('User'),
    errHandler = require('../utils/errHandler'),
    duplicateMsg = 'Post already exists';

exports.createPost = function(req, res) {
    if (req.query.accessToken) {
        User.findOne({ accessToken: req.query.accessToken }, '_id', function(err, user) {
            errHandler.handleErr(undefined, err, res);

            if (!user || user._id !== req.body._id) {
                res.status(401).send('Unauthorized access');
            }

            var post = new Post(req.body);

            post.save(function(err) {
                errHandler.handleErr(duplicateMsg, err, res);

                res.status(201).json(post);
            });
        });
    } else {
        res.status(400).send('Invalid query parameter');
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
            errHandler.handleErr(undefined, err, res);

		    res.status(200).json(posts);
	    });
};