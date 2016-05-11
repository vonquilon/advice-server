var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
    strings = require('../utils/strings');

var PostSchema = new Schema({
	content: {
		type: String,
		required: strings.schema.required,
		trim: true,
		maxlength: [1000, string.schema.maxlength]
	},
	category: {
		type: String,
		enum: ['Relationships', 'Financial', 'Mental Health', 'Jobs', 'Depression', 'Sexism', 'Racism', 'Physical Health'],
		required: strings.schema.required
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: strings.schema.required
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