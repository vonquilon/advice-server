var config = require('./config'),
	mongoose = require('mongoose');

module.exports = function() {
	var db = mongoose.connect(config.db);

	require('../models/user.server.model');
	require('../models/post.server.model');
	require('../models/session.server.model');

	return db;
};