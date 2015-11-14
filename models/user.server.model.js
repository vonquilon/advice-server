var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	uniqueValidator = require('mongoose-unique-validator'),
	security = require('../utils/security'),
	messages = require('../utils/messages');

var UserSchema = new Schema({
	email: {
		type: String,
		trim: true,
		unique: true,
		uniqueCaseInsensitive: true,
		required: messages.schema.required,
		match: [/.+\@.+\..+/, messages.schema.invalid],
		maxlength: [50, messages.schema.maxlength]
	},
	username: {
		type: String,
		trim: true,
		unique: true,
		uniqueCaseInsensitive: true,
		required: messages.schema.required,
		minlength: [2, messages.schema.minlength],
		maxlength: [30, messages.schema.maxlength]
	},
	password: {
		type: String,
		required: messages.schema.required,
		validate: [
			function(password) {
				return password && password.length >= 6 && password.length <= 16;
			}, messages.schema.users.pwdlength
		],
		match: [/.*[0-9]+.*/, messages.schema.users.invalidPwd]
	},
	role: {
		type: String,
		enum: ['admin', 'user'],
		default: 'user'
	},
	accessToken: String,
	salt: String,
	provider: {
		type: String,
		required: messages.schema.required
	},
	created: {
		type: Date,
		default: Date.now
	}
});

UserSchema.pre('save', function(next) {
	if (this.password && !this.salt) {
		this.salt = security.genRandomStr();
		this.password = this.hashPassword(this.password);
	}

	next();
});

UserSchema.methods.hashPassword = function(password) {
	return security.hashPassword(password, this.salt);
};

UserSchema.methods.authenticate = function(password) {
	return this.password === this.hashPassword(password);
};

UserSchema.methods.genAccTokAndSave = function(reset, options, cb) {
	if (typeof reset == 'boolean') {
        this.accessToken = '';
    } else if (this.email && this.username) {
        cb = options;
        options = reset;
        this.accessToken = security.genHmac(security.genRandomStr(), this.email, this.username);
    }

    if (cb) {
        return this.save(options, cb);
    } else {
        return this.save(options);
    }
};

UserSchema.methods.validateAccTok = function(accessToken) {
    return this.accessToken === accessToken;
};

UserSchema.methods.isAdmin = function() {
    return this.role === 'admin';
};

UserSchema.methods.clean = function() {
    return {
    	_id: this._id,
    	email: this.email,
    	username: this.username,
    	accessToken: this.accessToken,
    	created: this.created
    };
};

UserSchema.statics.findByUsername = function(username) {
	arguments[0] = { username: username };
    return this.findOne.apply(this, arguments);
};

UserSchema.plugin(uniqueValidator, { message: messages.schema.alreadyExists });
mongoose.model('User', UserSchema);