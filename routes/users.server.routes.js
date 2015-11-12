var users = require('../controllers/users.server.controller');

module.exports = function(app) {
	app.route('/register')
		.post(users.create)
		.get(users.signin)
		.put(users.signout);

	app.get('/users', users.getUserInfo);

	app.route('/users/:userId')
		.put(users.update)
        .delete(users.delete);

	app.param('userId', users.userById);
};