var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var ReplySchema = new Schema({
	content: {
		type: String,
		required: true
	},
	author: {
		type: String,
		required: true
	},
	replyTo: {
		type: Schema.Types.ObjectId,
		required: true
	},
	created: {
		type: Date,
		default: Date.now
	}
});

ReplySchema.statics.findRepliesByReplyToId = function(replyToId, cb) {
	this.find({replyTo: replyToId}, cb);
};

mongoose.model('Reply', ReplySchema);