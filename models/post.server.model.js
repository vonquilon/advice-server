var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var PostSchema = new Schema({
	content: {
		type: String,
		required: 'Content is required',
		trim: true
	},
	category: {
		type: String,
		enum: ['Relationships', 'Financial', 'Mental Health', 'Jobs', 'Depression', 'Sexism', 'Racism', 'Physical Health', 'Reply'],
		required: 'Category is required'
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: 'Author is required'
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