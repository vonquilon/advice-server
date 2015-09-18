var posts = require('../controllers/posts.server.controller');

module.exports = function(app) {
	app.route('/posts')
		.get(posts.listPosts)
		.post(posts.createPost);

	app.get('/posts/:username', posts.getPostsFromUsername);

	app.param('username', posts.findPostsByUsername);
};