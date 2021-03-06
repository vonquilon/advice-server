var sessions = require('../controllers/sessions.server.controller');

module.exports = function(app) {
	app.route('/sessions')
		.post(sessions.createSession);

	app.route('/sessions/:sessionId')
		.get(sessions.getSession)
		.delete(sessions.deleteSession);

	app.param('sessionId', sessions.findSessionById);
};