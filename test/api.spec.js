/**
 * Created by EXTIGLGCORREAG on 13/05/2014.
 */
var request = require('supertest');
var should = require('should');
var app = require('../src/backend/server');
var config = require('../src/backend/config');

describe('API', function () {
    it('GET / should be ok', function (done) {
        request(app)
            .get('/')
            .expect(200, done);
    });
    it('GET /api/v' + config.api.latestVersion + '/ should be ok', function (done) {
        request(app)
            .get('/api/v' + config.api.latestVersion + '/')
            .expect(200, done);
    });
});

describe('API /users', function () {
    it('GET /api/v' + config.api.latestVersion + '/users requires authentication', function (done) {
        request(app)
            .get('/api/v' + config.api.latestVersion + '/')
            .expect(200, done);
    });
});