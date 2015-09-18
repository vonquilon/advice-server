var replies = require('../controllers/replies.server.controller');

module.exports = function(app) {
	app.post('/replies', replies.createReply);

	app.get('/replies/:replyToId', replies.getRepliesFromReplyToId);

	app.param('replyToId', replies.findRepliesByReplyToId);
};