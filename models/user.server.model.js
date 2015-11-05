var mongoose = require('mongoose'),
	crypto = require('crypto'),
	Schema = mongoose.Schema;

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
	salt: {
		type: String
	},
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
		this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
		this.password = this.hashPassword(this.password);
	}

	next();
});

UserSchema.methods.hashPassword = function(password) {
	return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
};

UserSchema.methods.authenticate = function(password) {
	return this.password === this.hashPassword(password);
};

mongoose.model('User', UserSchema);