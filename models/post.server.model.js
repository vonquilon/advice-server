var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var PostSchema = new Schema({
	content: {
		type: String,
		required: true
	},
	category: {
		type: String,
		enum: ['Relationships', 'Financial', 'Mental Health', 'Jobs', 'Depression', 'Sexism', 'Racism', 'Physical Health']
	},
	author: {
		type: String,
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