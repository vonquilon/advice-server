var Post = require('mongoose').model('Post');

exports.createPost = function(req, res, next) {
	//if (req.user) {
		var post = new Post(req.body);
		//post.author = req.user._id;
		post.save(function(err) {
			if (err) {
				return next(err);
			}

			res.json(post);
		});
	//} else {
	//	next();
	//}
};

exports.listPosts = function(req, res, next) {
	Post.find({}, function(err, posts) {
		if (err) {
			return next(err);
		}

		res.json(posts);
	});
};

exports.getPostsFromUsername = function(req, res) {
	res.json(req.posts);
};

exports.findPostsByUsername = function(req, res, next, username) {
	Post.findPostsByUsername(username, function(err, posts) {
		if (err) {
			return next(err);
		}

		req.posts = posts;
		next();
	});
};