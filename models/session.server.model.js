var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var SessionSchema = new Schema({
	_id: {
		type: String,
		unique: true,
		required: true
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	lastUsed: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('Session', SessionSchema);