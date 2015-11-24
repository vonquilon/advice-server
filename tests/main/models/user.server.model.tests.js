var app = require('../../../server'),
    helper = require('../../helpers/user.model.helper'),
    should = require('should'),
    errHandler = require('../../../utils/errHandler'),
    strings = require('../../../utils/strings'),
    security = require('../../../utils/security');

var user;

describe('User Model Unit Tests:', function() {
    beforeEach(function() {
        user = helper.getValidUser();
    });

    describe('Testing validations', function() {
        it('Should save without problems when all user fields are valid', function(done) {
            user.save(function(err) {
                should.not.exist(err);
                done();
            });
        });

        it('Should not save when email is not in a valid format (i.e., "user@example.com")', function(done) {
            user.email = 'invalid-email';
            user.save(function(err) {
                should.exist(err);
                err.should.have.property('errors');
                testErr(err, 'invalid email "invalid-email"');
                done();
            });
        });

        it('Should not save when email is missing', function(done) {
            user.email = '';
            user.save(function(err) {
                should.exist(err);
                err.should.have.property('errors');
                testErr(err, 'email is required');
                done();
            });
        });

        it('Should not save when email is more than 50 characters', function(done) {
            user.email = security.genRandomString(128).substring(0, 39) + '@example.com'; // string length is 51
            user.save(function(err) {
                should.exist(err);
                err.should.have.property('errors');
                testErr(err, 'email cannot exceed 50 characters');
                done();
            });
        });

        function testErr(err, expectedMsg) {
            var errMsg = errHandler.getErrMsg(err);
            errMsg.should.have.properties({msg: expectedMsg, statCode: 409});
        }
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