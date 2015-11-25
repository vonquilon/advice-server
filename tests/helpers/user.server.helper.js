var User = require('mongoose').model('User');

module.exports = {
    getValidUser: function(body) {
    	var _body = {
            email: 'user@example.com',
            username: 'user',
            password: 'username1',
            provider: 'fb'
        };

        if (body) {
        	for (var key in body) {
        		if (body.hasOwnProperty(key) && _body.hasOwnProperty(key)) {
        			_body[key] = body[key];
        		}
        	}
        }

        return new User(_body);
    },
    User: User
};