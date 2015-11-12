var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
    messages = require('../utils/messages');

var PostSchema = new Schema({
	content: {
		type: String,
		required: messages.schema.required,
		trim: true
	},
	category: {
		type: String,
		enum: ['Relationships', 'Financial', 'Mental Health', 'Jobs', 'Depression', 'Sexism', 'Racism', 'Physical Health', 'Reply'],
		required: messages.schema.required
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: messages.schema.required
	},
	replyTo: {
		type: Schema.Types.ObjectId,
		ref: 'Post'
	},	
	created: {
		type: Date,
		default: Date.now
	}
});

PostSchema.statics.findPostsByUsername = function(username, cb) {
    var populateOptions = {
        path: 'author',
        select: 'username',
        match: { username: username }
    };

    if (!cb) {
        return this.find().populate(populateOptions);
    }

	this.find().populate(populateOptions).exec(cb);
};

mongoose.model('Post', PostSchema);