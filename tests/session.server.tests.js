var helper = require('./helpers/server.helper.js'),
    should = require('should'),
    errHandler = require('../utils/errHandler'),
    strings = require('../utils/strings');

module.exports = function(req) {
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

            var user,
                session;

            before(function(done) {
                user = helper.getValidUser();
                user.genAccTokAndSave(function() {
                    session = new helper.Session({ user: user._id, accessToken: user.accessToken });
                    session.save(function() {
                        done();
                    });
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

            it('Should return the user from the session when validations pass', function(done) {
                req.get('/sessions/'+session._id)
                    .accept('application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) return done(err);

                        res.body.should.be.an.Object;
                        res.body.should.have.properties({
                            _id: user._id+'',
                            email: user.email,
                            created: user.created.toJSON()
                        });
                        res.body.should.not.have.properties('password', 'role', 'salt', 'provider');
                        res.body.should.have.property('accessToken').and.not.equal(user.accessToken);
                        user.accessToken = res.body.accessToken;

                        done();
                    });
            });

            it('Should send an error when a session is not found', function(done) {
                var unsavedSession = new helper.Session({ user: user._id, accessToken: user.accessToken });

                req.get('/sessions/'+unsavedSession._id)
                    .accept('text/html')
                    .expect('Content-Type', /text/)
                    .expect(404)
                    .end(function(err, res) {
                        if (err) return done(err);

                        res.text.should.be.a.String;
                        res.text.should.equal(strings.statCode._404.sessionNotFound);

                        done();
                    });
            });

            it('Should delete the session when validations pass', function(done) {
                var newSession = new helper.Session({ user: user._id, accessToken: user.accessToken });
                newSession.save(function() {
                    req.delete('/sessions/'+newSession._id)
                        .accept('text/html')
                        .expect(204)
                        .end(function(err, res) {
                            if (err) return done(err);

                            res.text.should.be.empty();
                            helper.Session.findById(newSession._id, function(session) {
                                should.not.exist(session);
                                done();
                            });
                        });
                });
            });

            it('Should send an error when a user tries to delete an inexistent session', function(done) {
                var unsavedSession = new helper.Session({ user: user._id, accessToken: user.accessToken });

                req.delete('/sessions/'+unsavedSession._id)
                    .accept('text/html')
                    .expect('Content-Type', /text/)
                    .expect(404)
                    .end(function(err, res) {
                        if (err) return done(err);

                        res.text.should.be.a.String;
                        res.text.should.equal(strings.statCode._404.sessionNotFound);

                        done();
                    });
            });

            after(function(done) {
                session.remove(function() {
                    user.remove(function () {
                        done();
                    });
                });
            });

        }); // END--Testing api calls

    }); // END--Session Unit Tests:
}