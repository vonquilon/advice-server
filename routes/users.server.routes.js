var users = require('../controllers/users.server.controller');

module.exports = function(app) {
	app.post('/signup', users.create);

	app.post('/signin', user.signin);

	app.get('/users', users.getUserInfo);

	app.route('/users/:userId')
		.put(users.update)
        .delete(users.delete);

	app.param('userId', users.userById);
};