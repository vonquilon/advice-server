var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	security = require('../utils/security'),
	strings = require('../utils/strings');

var UserSchema = new Schema({
	email: {
		type: String,
		trim: true,
		unique: true,
		required: strings.schema.required,
		match: [/.+\@.+\..+/, strings.schema.invalid],
		maxlength: [50, strings.schema.maxlength]
	},
	username: {
		type: String,
		trim: true,
		unique: true,
		required: strings.schema.required,
        validate: [
            function(username) {
                return /^([\w\-\']|\.(?!\.))(\.?[\w\-\'])*([\w\-\']|\.)$/g.test(username);
            }, strings.schema.users.invalidUsrNam
        ],
		maxlength: [30, strings.schema.maxlength]
	},
	password: {
		type: String,
		required: strings.schema.required,
		validate: [
			function(password) {
				return this.salt ? true : password && password.length >= 6 && password.length <= 16;
			}, strings.schema.users.pwdlength
		],
		match: [/.*[0-9]+.*/, strings.schema.users.invalidPwd]
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
		required: strings.schema.required
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
	return password ? this.password === this.hashPassword(password) : false;
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

UserSchema.methods.isSameEmail = function(email) {
	if (typeof email == 'string') {
		email = email.trim();
	}

	return this.email === email;
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

mongoose.model('User', UserSchema);