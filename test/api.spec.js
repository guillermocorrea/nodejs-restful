/**
 * Created by EXTIGLGCORREAG on 13/05/2014.
 */
var request = require('supertest');
//var utils = require('./utils');
var app = require('../src/backend/server');
var config = require('../src/backend/config');

/*describe('API oauth', function () {
    it('POST /ouath/token should generate token', function (done) {
        request(app)
            .post('/oauth/token')
            .expect(200, done);
    });
});*/

describe('API', function () {
    it('GET / should be ok', function (done) {
        request(app)
            .get('/')
            .expect(200, done);
    });
    it('GET ' + app.get('apiPath') + ' should be ok', function (done) {
        request(app)
            .get(app.get('apiPath') + '/')
            .expect(200, done);
    });
});

describe('API /users', function () {
    it('GET ' + app.get('apiPath') + '/users requires authentication', function (done) {
        request(app)
            .get(app.get('apiPath') + '/users')
            .expect(401, done);
    });
    it('GET ' + app.get('apiPath') + '/users requires authentication', function (done) {
        request(app)
            .get(app.get('apiPath') + '/users')
            .expect(401, done);
    });
});