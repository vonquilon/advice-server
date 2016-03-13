var app = require('../../server'),
    helper = require('../helpers/server.helper.js'),
    should = require('should'),
    request = require('supertest'),
    errHandler = require('../../utils/errHandler'),
    strings = require('../../utils/strings'),
    Session = require('mongoose').model('Session');

describe('Session Unit Tests:', function() {

    describe('Testing schema validations', function() {

        var userId;

        before(function(done) {
            helper.getValidUser().genAccTokAndSave(function(user) {
                userId = user._id;
                done();
            });
        });

    }); // END--Testing schema validations

}); // END--Session Unit Tests: