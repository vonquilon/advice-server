var posts = require('../controllers/posts.server.controller');

module.exports = function(app) {
	app.route('/posts')
		.post(posts.create);
};