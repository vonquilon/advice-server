var User = require('mongoose').model('User'),
    Session = require('mongoose').model('Session');

module.exports = {
    User: User,
    Session: Session,

    getValidUser: function(body) {
    	var _body = {
            email: 'user@example.com',
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
    testErr: function(expectedMsg, expectedStatCode) {
        var msg, statCode;

        if (typeof expectedMsg == 'string') {
            msg = expectedMsg;
            statCode = expectedStatCode ? expectedStatCode : 409;
        } else {
            statCode = expectedMsg;
            msg = strings.statCode._500.somethingWentWrong;
        }

        return {msg: msg, statCode: statCode};
    }
};