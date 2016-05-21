var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
    strings = require('../utils/strings');

var PostSchema = new Schema({
	content: {
		type: String,
		required: strings.schema.required,
		trim: true,
		maxlength: [1000, strings.schema.maxlength]
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
	latitude: {
		type: Number,
		required: strings.schema.required
	},
	longitude: {
		type: Number,
		required: strings.schema.required
	},
	created: {
		type: Date,
		default: Date.now
	}
});

PostSchema.methods.clean = function() {
	return {
		_id: this._id,
		content: this.content,
		category: this.category,
		author: this.author,
		created: this.created
	};
};

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