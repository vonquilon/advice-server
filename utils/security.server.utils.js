var crypto = require('crypto');

exports.genHmac = function(key) {
	var hmac = crypto.createHmac('sha1', key);

	hmac.setEncoding('base64');
	var i;
	for (var i = 0; i < arguments.length; i++) {
		hmac.write(arguments[i]);
	}
	hmac.end();

	return hmac.read().toString('base64');
};

exports.genRandomString = function() {
	return new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
};

exports.getECDH = function() {
	console.log(crypto.getCurves());

	return crypto.createECDH('secp384r1').generateKeys();
};