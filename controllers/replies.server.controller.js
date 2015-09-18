var Reply = require('mongoose').model('Reply');

exports.createReply = function(req, res, next) {
	//if (req.user) {
		var reply = new Reply(req.body);

		reply.save(function(err) {
			if (err) {
				return next(err);
			}

			res.json(reply);
		});
	/*} else {
		next();
	}*/
};

exports.getRepliesFromReplyToId = function(req, res) {
	res.json(req.replies);
};

exports.findRepliesByReplyToId = function(req, res, next, replyToId) {
	Reply.findRepliesByReplyToId(replyToId, function(err, replies) {
		if (err) {
			return next(err);
		}

		req.replies = replies;
		next();
	});
};