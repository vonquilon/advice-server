var app = require('../../server'),
    helper = require('../helpers/server.helper.js'),
    should = require('should'),
    request = require('supertest'),
    errHandler = require('../../utils/errHandler'),
    strings = require('../../utils/strings'),
    security = require('../../utils/security');

describe('Tests:', function() {

    var req = request('http://localhost:3000');

    describe('User Unit Tests:', function() {

        describe('Testing schema validations', function() {

            var user, user2;

            before(function(done) {
                user2 = helper.getValidUser();
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

            it('Should not save when email is not in a valid format (i.e., "blah-blah")', function(done) {
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
                var errMsg = errHandler.getErrMsg(err);
                errMsg.should.have.properties(helper.testErr(expectedMsg, expectedStatCode));
            }

        }); // END--Testing schema validations

        describe('Testing api calls', function() {

            var userBody = {
                email: 'iamuser@ex.com',
                password: 'wordpass52'
            };
            var user;

            before(function(done) {
                user = helper.getValidUser(userBody);
                user.genAccTokAndSave(function() {
                    done();
                });
            });

            it('Should register a new user when validations pass', function(done) {
                var newUser = {
                    email: 'newuser@ex.com',
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
                        res.body.should.have.properties({ email: newUser.email });
                        res.body.should.not.have.properties('password', 'role', 'salt', 'provider');

                        helper.User.findByIdAndRemove(res.body._id, function() {
                            done();
                        });
                    });
            });

            it('Should not register a new user when validation(s) fail', function(done) {
                var newUser = {
                    email: 'newuser@ex.com',
                    password: 'codepass'
                };

                req.post('/register')
                    .accept('text/html')
                    .send(newUser)
                    .expect('Content-Type', /text/)
                    .expect(409, done);
            });

            it("Should reassign the role property to 'user' if the role property exists in the request body", function(done) {
                var newUser = {
                    email: 'newuser@ex.com',
                    password: 'codepass1',
                    role: 'admin'
                };

                req.post('/register')
                    .accept('application/json')
                    .send(newUser)
                    .expect('Content-Type', /json/)
                    .expect(201)
                    .end(function(err, res) {
                        if (err) return done(err);

                        res.body.should.be.an.Object;
                        res.body.should.have.property('_id');

                        helper.User.findById(res.body._id, 'role', function(err, user) {
                            user.should.have.property('role', 'user');

                            helper.User.findByIdAndRemove(res.body._id, function() {
                                done();
                            });
                        });
                    });
            });

            it('Should sign in an existing user and generate a new access token', function(done) {
                req.get('/register')
                    .accept('application/json')
                    .set(strings.headerNames.email, userBody.email)
                    .set(strings.headerNames.password, userBody.password)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) return done(err);

                        res.body.should.be.an.Object;
                        res.body.should.have.properties('_id', 'created');
                        res.body.should.have.properties({ email: userBody.email });
                        res.body.should.not.have.properties('password', 'role', 'salt', 'provider');
                        res.body.should.have.property('accessToken').and.not.equal(user.accessToken);
                        user.accessToken = res.body.accessToken;

                        done();
                    });
            });

            it('Should send an error message during sign in when email is not found', function(done) {
                req.get('/register')
                    .accept('text/html')
                    .set(strings.headerNames.email, 'fakeemail')
                    .set(strings.headerNames.password, userBody.password)
                    .expect('Content-Type', /text/)
                    .expect(404)
                    .end(function(err, res) {
                        if (err) return done(err);

                        res.text.should.be.a.String;
                        res.text.should.equal(strings.statCode._404.unknownEmail);

                        done();
                    });
            });

            it('Should send an error message during sign in when password is wrong', function(done) {
                req.get('/register')
                    .accept('text/html')
                    .set(strings.headerNames.email, userBody.email)
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

            it('Should reset the access token when a user signs out', function(done) {
                req.put('/register')
                    .accept('text/html')
                    .send(user)
                    .expect(204)
                    .end(function(err) {
                        if (err) return done(err);

                        helper.User.findById(user._id, 'accessToken', function(err, usr) {
                            usr.should.have.property('accessToken', '');

                            user.update({ accessToken: user.accessToken }, function() {
                                done();
                            });
                        });
                    });
            });

            it('Should send an error when a user tries to sign out with an invalid access token', function(done) {
                req.put('/register')
                    .accept('text/html')
                    .send({ _id: user._id, accessToken: 'invalid' })
                    .expect('Content-Type', /text/)
                    .expect(401)
                    .end(function(err, res) {
                        if (err) return done(err);

                        res.text.should.be.a.String;
                        res.text.should.equal(strings.statCode._401.unauthAcc);

                        done();
                    });
            });

            after(function(done) {
                user.remove(function() {
                    done();
                });
            });

        }); // END--Testing api calls

    }); // END--User Unit Tests:

    describe('Session Unit Tests:', function() {

        describe('Testing schema validations', function() {

            var user,
                session;

            before(function(done) {
                user = helper.getValidUser();
                user.save(function() {
                    done();
                });
            });

            beforeEach(function() {
                session = new helper.Session({ user: user._id });
            });

            it('Should save without problems when all session fields are valid', function(done) {
                session.save(function(err) {
                    should.not.exist(err);
                    done();
                });
            });

            it('Should not save when the user ID is missing', function(done) {
                session.user = undefined;
                session.save(function(err) {
                    var errMsg = errHandler.getErrMsg(err);
                    errMsg.should.have.properties(helper.testErr('user is required'));
                    done();
                });
            });

            afterEach(function(done) {
                session.remove(function() {
                    done();
                });
            });

            after(function(done) {
                user.remove(function() {
                    done();
                });
            });

        }); // END--Testing schema validations

        describe('Testing api calls', function() {

            var user;

            before(function(done) {
                user = helper.getValidUser();
                user.genAccTokAndSave(function() {
                    done();
                });
            });

            it('Should create a new session when validations pass', function(done) {
                var newSession = { user: user._id, accessToken: user.accessToken };

                req.post('/sessions')
                    .accept('application/json')
                    .send(newSession)
                    .expect('Content-Type', /json/)
                    .expect(201)
                    .end(function(err, res) {
                        if (err) return done(err);

                        res.body.should.be.an.Object;
                        res.body.should.have.property('_id');
                        res.body.should.not.have.property('lastUsed');

                        helper.Session.findByIdAndRemove(res.body._id, function() {
                            done();
                        });
                    });
            });

            it('Should not create a new session when a user is not found', function(done) {
                var user2 = helper.getValidUser({ email: 'user2@example.com' });
                user2.save(function() {
                    var newSession = { user: user2._id, accessToken: user.accessToken };

                    user2.remove(function() {
                        req.post('/sessions')
                            .accept('text/html')
                            .send(newSession)
                            .expect('Content-Type', /text/)
                            .expect(401)
                            .end(function(err, res) {
                                if (err) return done(err);

                                res.text.should.be.a.String;
                                res.text.should.equal(strings.statCode._401.unauthAcc);

                                done();
                            });
                    });
                });
            });

            it('Should not create a new session when an access token is invalid', function(done) {
                var newSession = { user: user._id, accessToken: 'blah blah' };

                req.post('/sessions')
                    .accept('text/html')
                    .send(newSession)
                    .expect('Content-Type', /text/)
                    .expect(401)
                    .end(function(err, res) {
                        if (err) return done(err);

                        res.text.should.be.a.String;
                        res.text.should.equal(strings.statCode._401.unauthAcc);

                        done();
                    });
            });

            after(function(done) {
                user.remove(function() {
                    done();
                });
            });

        }); // END--Testing api calls

        after(function(done) {
            app.close(function() {
                done();
            });
        });

    }); // END--Session Unit Tests:

    after(function(done) {
        app.close(function() {
            done();
        });
    });

}); // END--Tests: