var app = require('../../server'),
    helper = require('../helpers/user.server.helper'),
    should = require('should'),
    request = require('supertest'),
    errHandler = require('../../utils/errHandler'),
    strings = require('../../utils/strings'),
    security = require('../../utils/security');

describe('User Unit Tests:', function() {

    describe('Testing schema validations', function() {

        var user, user2;

        before(function(done) {
            user2 = helper.getValidUser();
            user2.username = 'iamauser';
            user2.email = 'iamauser@example.com';
            user2.save(function(){
                done();
            });
        });

        beforeEach(function() {
            user = helper.getValidUser();
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

        afterEach(function(done) {
            user.remove(function() {
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

    }); // END--Testing model validations

    describe('Testing api calls', function() {

        var userBody = {
            email: 'iamuser@ex.com',
            username: 'iamuser.25',
            password: 'wordpass52'
        };
        var user,
            req = request('http://localhost:3000');

        before(function(done) {
            user = helper.getValidUser(userBody);
            user.save(function() {
                done();
            });
        });

        it('Should register a new user when validations pass', function(done) {
            var newUser = {
                email: 'newuser@ex.com',
                username: 'newuser',
                password: 'codepass1'
            };

            req.post('/register')
                .accept('application/json')
                .send(newUser)
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function(err, res) {
                    if (err) return done(err);

                    res.body.should.be.an.Object;
                    res.body.should.have.properties('_id', 'accessToken', 'created');
                    res.body.should.have.properties({ email: newUser.email, username: newUser.username });
                    res.body.should.not.have.properties('password', 'role', 'salt', 'provider');

                    helper.User.findByIdAndRemove(res.body._id, function() {
                        done();
                    });
                });
        });

        it('Should not register a new user when validation(s) fail', function(done) {
            var newUser = {
                email: 'newuser@ex.com',
                username: 'newuser',
                password: 'codepass'
            };

            req.post('/register')
                .accept('text/html')
                .send(newUser)
                .expect('Content-Type', /text/)
                .expect(409, done);
        });

        it('Should sign in an existing user and generate a new access token', function(done) {
            req.get('/register')
                .accept('application/json')
                .set(strings.headerNames.username, userBody.username)
                .set(strings.headerNames.password, userBody.password)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);

                    res.body.should.be.an.Object;
                    res.body.should.have.properties('_id', 'created');
                    res.body.should.have.properties({ email: userBody.email, username: userBody.username });
                    res.body.should.not.have.properties('password', 'role', 'salt', 'provider');
                    res.body.should.have.property('accessToken').and.not.equal(user.accessToken);

                    done();
                });
        });

        it('Should send an error message during sign in when user is not found', function(done) {
            req.get('/register')
                .accept('text/html')
                .set(strings.headerNames.username, 'fakeuser')
                .set(strings.headerNames.password, userBody.password)
                .expect('Content-Type', /text/)
                .expect(404)
                .end(function(err, res) {
                    if (err) return done(err);

                    res.text.should.be.a.String;
                    res.text.should.equal(strings.statCode._404.unknownUsrNam);

                    done();
                });
        });

        it('Should send an error message during sign in when password is wrong', function(done) {
            req.get('/register')
                .accept('text/html')
                .set(strings.headerNames.username, userBody.username)
                .set(strings.headerNames.password, 'wrongpassword')
                .expect('Content-Type', /text/)
                .expect(401)
                .end(function(err, res) {
                    if (err) return done(err);

                    res.text.should.be.a.String;
                    res.text.should.equal(strings.statCode._401.wrongPassword);

                    done();
                });
        });

        after(function(done) {
            user.remove(function() {
                done();
            });
        });

    });

    after(function(done) {
        app.close(function() {
            done();
        });
    });

}); // END--User Unit Tests: