var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	strings = require('../utils/strings');

var SessionSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: strings.schema.required
	},
	lastUsed: {
		type: Date,
		default: Date.now
	}
});

SessionSchema.methods.clean = function() {
	return {
		_id: this._id
	};
}

mongoose.model('Session', SessionSchema);