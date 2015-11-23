var User = require('mongoose').model('User');

module.exports = {
    getValidUser: function() {
        return new User({
            email: 'user@example.com',
            username: 'user',
            password: 'username'
        });
    }
};