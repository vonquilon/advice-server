var app = require('../../server'),
    helper = require('../helpers/user.model.helper'),
    should = require('should'),
    request = require('supertest'),
    errHandler = require('../../utils/errHandler'),
    strings = require('../../utils/strings'),
    security = require('../../utils/security');

var user;

describe('User Unit Tests:', function() {
    beforeEach(function() {
        user = helper.getValidUser();
    });

    describe('Testing validations', function() {
        var user2;

        before(function(done) {
            user2 = helper.getValidUser();
            user2.username = 'iamauser';
            user2.email = 'iamauser@example.com';
            user2.save(function(){
                done();
            });
        });

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
            user.email = undefined;
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

        it('Should not save when email already exists in the database', function(done) {
            user.email = user2.email;
            user.save(function(err) {
                should.exist(err);
                err.should.have.property('code').and.equal(11000);
                testErr(err, 'email "' + user.email +'" already exists');
                done();
            });
        });

        it('Should not save when username is missing', function(done) {
            user.username = undefined;
            user.save(function(err) {
                should.exist(err);
                err.should.have.property('errors');
                testErr(err, 'username is required');
                done();
            });
        });

        it('Should not save when username is invalid (i.e., 2 consecutive periods: user..25)', function(done) {
            user.username = 'user..25';
            user.save(function(err) {
                should.exist(err);
                err.should.have.property('errors');
                testErr(err, strings.schema.users.invalidUsrNam);
                done();
            });
        });

        it('Should not save when username is less than 2 chars', function(done) {
            user.username = 'u';
            user.save(function(err) {
                should.exist(err);
                err.should.have.property('errors');
                testErr(err, strings.schema.users.invalidUsrNam);
                done();
            });
        });

        it('Should not save when username is more than 30 chars', function(done) {
            user.username = security.genRandomString(128, 'hex').substring(0, 31); // string length is 31
            user.save(function(err) {
                should.exist(err);
                err.should.have.property('errors');
                testErr(err, 'username cannot exceed 30 characters');
                done();
            });
        });

        it('Should not save when username already exists in the database', function(done) {
            user.username = user2.username;
            user.save(function(err) {
                should.exist(err);
                err.should.have.property('code').and.equal(11000);
                testErr(err, 'username "' + user.username +'" already exists');
                done();
            });
        });

        it('Should not save when password is missing', function(done) {
            user.password = undefined;
            user.save(function(err) {
                should.exist(err);
                err.should.have.property('errors');
                testErr(err, 'password is required');
                done();
            });
        });

        it('Should not save when password is less than 6 chars', function(done) {
            user.password = security.genRandomString(64, 'hex').substring(0, 5); // string length is 5
            user.save(function(err) {
                should.exist(err);
                err.should.have.property('errors');
                testErr(err, strings.schema.users.pwdlength);
                done();
            });
        });

        it('Should not save when password is greater than 16 chars', function(done) {
            user.password = security.genRandomString(64, 'hex').substring(0, 17); // string length is 17
            user.save(function(err) {
                should.exist(err);
                err.should.have.property('errors');
                testErr(err, strings.schema.users.pwdlength);
                done();
            });
        });

        it("Should not save when password doesn't contain at least one number", function(done) {
            user.password = 'userisme';
            user.save(function(err) {
                should.exist(err);
                err.should.have.property('errors');
                testErr(err, strings.schema.users.invalidPwd);
                done();
            });
        });

        it("Should not save when provider is missing", function(done) {
            user.provider = undefined;
            user.save(function(err) {
                should.exist(err);
                err.should.have.property('errors');
                testErr(err, 'provider is required');
                done();
            });
        });

        after(function(done) {
            user2.remove(function() {
                done();
            });
        });

        function testErr(err, expectedMsg, expectedStatCode) {
            var msg, statCode;

            if (typeof expectedMsg == 'string') {
                msg = expectedMsg;
                statCode = expectedStatCode ? expectedStatCode : 409;
            } else {
                statCode = expectedMsg;
                msg = strings.statCode._500.somethingWentWrong;
            }

            var errMsg = errHandler.getErrMsg(err);
            errMsg.should.have.properties({msg: msg, statCode: statCode});
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