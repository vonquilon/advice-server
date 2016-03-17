var app = require('../../server'),
    helper = require('../helpers/server.helper.js'),
    should = require('should'),
    request = require('supertest'),
    errHandler = require('../../utils/errHandler'),
    strings = require('../../utils/strings'),
    Session = require('mongoose').model('Session');

// PUT ALL TESTS IN A SINGLE TEST FILE

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
            session = new Session({ user: user._id });
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

}); // END--Session Unit Tests: