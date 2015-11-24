var app = require('../../../server'),
    helper = require('../../helpers/user.model.helper'),
    should = require('should');

var user;

describe('User Model Unit Tests:', function() {
    beforeEach(function() {
        user = helper.getValidUser();
    });

    describe('Testing validations', function() {
        it('Should save without problems when all user fields are valid', function() {
            user.save(function(err) {
                should.not.exist(err);
            });
        });

        it('Should not save when email is invalid', function() {
            user.email = 'invalid-email';
            user.save(function(err) {
                should.exist(err);
            });
        });
    });

    afterEach(function(done) {
        user.remove(function() {
            done();
        });
    });

    after(function(done) {
        app.close(function() {
            done();
        });
    });
});