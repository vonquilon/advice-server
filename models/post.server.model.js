var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var PostSchema = new Schema({
	content: {
		type: String,
		required: true
	},
	category: {
		type: String,
		enum: ['Relationships', 'Financial', 'Mental Health', 'Jobs', 'Depression', 'Sexism', 'Racism', 'Physical Health', 'Reply'],
		required: true
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	replyTo: {
		type: Schema.Types.ObjectId,
		ref: 'Post',
		required: true
	},	
	created: {
		type: Date,
		default: Date.now
	}
});

PostSchema.statics.findPostsByUsername = function(username, cb) {
	this.find({author: username }, cb);
};

mongoose.model('Post', PostSchema);