var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	security = require('../utils/security');

var UserSchema = new Schema({
	email: {
		type: String,
		trim: true,
		unique: 'Email already exists',
		required: 'Email is required',
		match: [/.+\@.+\..+/, 'Invalid email address'],
		maxlength: [50, 'Email cannot exceed {MAXLENGTH} characters']
	},
	username: {
		type: String,
		trim: true,
		unique: 'Username already exists',
		required: 'Username is required',
		minlength: [2, 'Username must contain at least {MINLENGTH} characters'],
		maxlength: [30, 'Username cannot exceed {MAXLENGTH} characters']
	},
	password: {
		type: String,
		required: 'Password is required',
		validate: [
			function(password) {
				return password && password.length >= 6 && password.length <= 16;
			}, 'Passwords should be between 8 and 16 characters'
		],
		match: [/.*[0-9]+.*/, 'Passwords should contain at least 1 number']
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
		required: 'Provider is required'
	},
	created: {
		type: Date,
		default: Date.now
	}
});

UserSchema.pre('save', function(next) {
	if (this.password) {
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

UserSchema.methods.genAccTokAndSave = function(cb) {
	if (this.email && this.username) {
		this.accessToken = security.genHmac(security.genRandomStr(), this.email, this.username);
	}

	this.save(cb);
};

UserSchema.methods.validateAccTok = function(accessToken) {
    return this.accessToken === accessToken;
};

UserSchema.methods.isAdmin = function() {
    return this.role === 'admin';
};

UserSchema.methods.clean = function() {
    delete this.role;
    delete this.provider;
    delete this.salt;
    delete this.password;

    return this;
};

UserSchema.statics.findByUsername = function(username) {
    return this.findOne({ username: username }, arguments);
};

mongoose.model('User', UserSchema);