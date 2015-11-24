var crypto = require('crypto');

exports.genRandomStr = function() {
	return new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
};

exports.genRandomString = function(length) {
    return crypto.randomBytes(length).toString('base64');
};

exports.genHmac = function(key) {
	var hmac = crypto.createHmac('sha1', key);

	hmac.setEncoding('base64');
	for (var i = 0; i < arguments.length; i++) {
		hmac.write(arguments[i]);
	}
	hmac.write(Date.now().toString());
	hmac.write(exports.genRandomStr());
	hmac.end();

	return hmac.read().toString('base64');
};

exports.hashPassword = function(password, salt) {
	return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
};