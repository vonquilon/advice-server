var users = require('../controllers/users.server.controller'),
	passport = require('passport');

module.exports = function(app) {
	app.route('/signup')
		.post(users.create);

	app.route('/signin')
		.post(passport.authenticate('local'),
			function(req, res) {
				res.json(req.user);
			});

	app.get('/signout', users.signout);

	app.get('/users/:userId', users.getUser);

	app.param('userId', users.findUserById);

	app.get('/users', users.list);
};