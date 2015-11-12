var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	messages = require('../utils/messages');

var SessionSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: messages.schema.required
	},
	lastUsed: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('Session', SessionSchema);