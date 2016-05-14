var app = require('../server'),
    request = require('supertest');

describe('Tests:', function() {

    var req = request('http://localhost:3000');

    require('./user.server.tests')(req);
    require('./session.server.tests')(req);

    after(function(done) {
        app.close(function() {
            done();
        });
    });

}); // END--Tests: