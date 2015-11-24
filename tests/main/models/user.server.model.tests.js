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
        it('Should save without problems when all user fields are valid', function() {
            user.save(function(err) {
                should.not.exist(err);
            });
        });

        it('Should not save when email is not in a valid format (i.e., "user@example.com")', function() {
            user.email = 'invalid-email';
            user.save(function(err) {
                should.exist(err);
                err.should.have.property('errors');
                testErr(err, 'invalid email "invalid-email"');
            });
        });

        it('Should not save when email is missing', function() {
            delete user.email;
            user.save(function(err) {
                should.exist(err);
                err.should.have.property('errors');
                testErr(err, 'email is required');
            });
        });

        it('Should not save when email is more than 50 characters', function() {
            user.email = security.genRandomString(16) + '@example.com';
            console.log(user.email);
            user.save(function(err) {
                should.exist(err);
                err.should.have.property('errors');
                var errMsg = errHandler.getErrMsg(err);
                console.log(errMsg);
                errMsg.should.have.property('msg').and.have.property('statCode');
                errMsg.msg.should.eql('email is required');
                errMsg.statCode.should.equal(409);
            });
        });

        function testErr(err, expectedMsg) {
            var errMsg = errHandler.getErrMsg(err);
            console.log(errMsg);
            errMsg.should.have.property('msg').and.have.property('statCode');
            errMsg.msg.should.equal(expectedMsg);
            errMsg.statCode.should.equal(409);
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