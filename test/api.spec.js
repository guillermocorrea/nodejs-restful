/**
 * Created by EXTIGLGCORREAG on 13/05/2014.
 */
process.env.NODE_ENV = 'test';
var request = require('supertest');//var utils = require('./utils');
var app = require('../src/backend/server');
var UserModel           = require('../src/backend/models/users').UserModel;
var ClientModel         = require('../src/backend/models/users').ClientModel;
var AccessTokenModel    = require('../src/backend/models/users').AccessTokenModel;
var RefreshTokenModel   = require('../src/backend/models/users').RefreshTokenModel;
var faker               = require('Faker');
var log                 = require('../src/backend/libs/logger')(module);
var config = require('../src/backend/config');
var mongoose = require('mongoose');
var token = undefined;
var firstUser = new UserModel({ username: "andrey", password: "simplepassword" });

before(function (done) {
    //function seedDb(callback) {
    UserModel.remove({}, function(err) {
        firstUser.save(function(err, user) {
            if(err) return log.error(err);
            else log.info("New user - %s:%s",user.username,user.password);
        });

        for(i=0; i<4; i++) {
            var user = new UserModel({ username: faker.random.first_name().toLowerCase(), password: faker.Lorem.words(1)[0] });
            user.save(function(err, user) {
                if(err) return log.error(err);
                else log.info("New user - %s:%s",user.username,user.password);
            });
        }
    });

    ClientModel.remove({}, function(err) {
        var client = new ClientModel({ name: "OurService iOS client v1", clientId: "mobileV1", clientSecret:"abc123456" });
        client.save(function(err, client) {
            if(err) return log.error(err);
            else log.info("New client - %s:%s",client.clientId,client.clientSecret);
        });
    });
    AccessTokenModel.remove({}, function (err) {
        if (err) return log.error(err);
    });
    RefreshTokenModel.remove({}, function (err) {
        if (err) return log.error(err);
    });

    done();
});

function getToken(callback) {
    request(app)
        .post('/oauth/token/')
        .send({"grant_type": "password", "client_id": "mobileV1", "client_secret": "abc123456", "username": "andrey", "password": "simplepassword"})
        .set('Host', 'localhost:8080')
        .set('Accept-Encoding', 'gzip, deflate, compress')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('User-Agent', 'HTTPie/0.8.0')
        .end(function(err, res) {
            if (err) throw err;
            token = res.body.access_token;
            if (token === undefined) getToken(callback);
            callback(res.body);
        });
}

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
    it('GET ' + app.get('apiPath') + '/oauth/token can refresh token', function (done) {
        getToken(function(body) {
            request(app)
                .post('/oauth/token/')
                .send({"grant_type": "refresh_token", "client_id": "mobileV1", "client_secret": "abc123456", "refresh_token": body.refresh_token})
                .set('Host', 'localhost:8080')
                .set('Accept-Encoding', 'gzip, deflate, compress')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .set('User-Agent', 'HTTPie/0.8.0')
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    res.should.have.status(200);
                    done();
                });
        });
    });
});

describe('API /users', function () {
    it('GET ' + app.get('apiPath') + '/users requires authentication', function (done) {
        request(app)
            .get(app.get('apiPath') + '/users')
            .expect(401, done);
    });

    it('GET ' + app.get('apiPath') + '/users returns users', function (done) {
        getToken(function() {
            request(app)
                .get(app.get('apiPath') + '/users')
                .set('Host', 'localhost:8080')
                .set('Accept-Encoding', 'gzip, deflate, compress')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .set('User-Agent', 'HTTPie/0.8.0')
                .set('Authorization', 'Bearer ' + token)
                .expect(200, done);
        });
    });

    it('GET ' + app.get('apiPath') + '/users/:id requires authentication', function (done) {
        getToken(function() {
            request(app)
                .get(app.get('apiPath') + '/users/' + firstUser.username)
                .set('Host', 'localhost:8080')
                .set('Accept-Encoding', 'gzip, deflate, compress')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .set('User-Agent', 'HTTPie/0.8.0')
                .end(function(err, res) {
                    res.should.have.status(401);
                    done();
                });
        });
    });

    it('GET ' + app.get('apiPath') + '/users/:id get a specific user', function (done) {
        getToken(function() {
            request(app)
                .get(app.get('apiPath') + '/users/' + firstUser.username)
                .set('Host', 'localhost:8080')
                .set('Accept-Encoding', 'gzip, deflate, compress')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .set('User-Agent', 'HTTPie/0.8.0')
                .set('Authorization', 'Bearer ' + token)
                .end(function(err, res) {
                    res.body._id.should.be.ok;
                    res.should.have.status(200);
                    done();
                });
        });
    });

    it('POST ' + app.get('apiPath') + '/users requires authentication', function (done) {
        request(app)
            .post(app.get('apiPath') + '/users')
            .send({username: 'user', password: 'secret-pass'})
            .set('Host', 'localhost:8080')
            .set('Accept-Encoding', 'gzip, deflate, compress')
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .set('User-Agent', 'HTTPie/0.8.0')
            .expect(401)
            .end(function(err, res) {
                res.should.have.status(401);
                done();
            });
    });

    it('POST ' + app.get('apiPath') + '/users should validate user', function (done) {
        getToken(function() {
            request(app)
                .post(app.get('apiPath') + '/users')
                .send({invalidProperty: 'user', password: 'secret-pass'})
                .set('Host', 'localhost:8080')
                .set('Accept-Encoding', 'gzip, deflate, compress')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .set('User-Agent', 'HTTPie/0.8.0')
                .set('Authorization', 'Bearer ' + token)
                .expect(400)
                .end(function(err, res) {
                    res.should.have.status(400);
                    done();
                });
        });
    });

    it('POST ' + app.get('apiPath') + '/users create a user', function (done) {
        getToken(function() {
            request(app)
                .post(app.get('apiPath') + '/users')
                .send({username: 'user', password: 'secret-pass'})
                .set('Host', 'localhost:8080')
                .set('Accept-Encoding', 'gzip, deflate, compress')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .set('User-Agent', 'HTTPie/0.8.0')
                .set('Authorization', 'Bearer ' + token)
                .expect(200)
                .end(function(err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
    });

    it('PUT ' + app.get('apiPath') + '/users requires authentication', function (done) {
        getToken(function() {
            request(app)
                .put(app.get('apiPath') + '/users/' + firstUser.username)
                .send({username: 'user', password: 'secret-pass'})
                .set('Host', 'localhost:8080')
                .set('Accept-Encoding', 'gzip, deflate, compress')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .set('User-Agent', 'HTTPie/0.8.0')
                .expect(401)
                .end(function(err, res) {
                    res.should.have.status(401);
                    done();
                });
        });
    });

    it('PUT ' + app.get('apiPath') + '/users should update user', function (done) {
        getToken(function() {
            request(app)
                .put(app.get('apiPath') + '/users/' + firstUser.username)
                .send({username: 'user', password: 'secret-pass'})
                .set('Host', 'localhost:8080')
                .set('Accept-Encoding', 'gzip, deflate, compress')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .set('User-Agent', 'HTTPie/0.8.0')
                .set('Authorization', 'Bearer ' + token)
                .expect(200)
                .end(function(err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
    });

    it('DELETE ' + app.get('apiPath') + '/users/:id requires authentication', function (done) {
        getToken(function() {
            request(app)
                .del(app.get('apiPath') + '/users/' + firstUser.username)
                .set('Host', 'localhost:8080')
                .set('Accept-Encoding', 'gzip, deflate, compress')
                .set('Accept', 'application/json')
                .set('User-Agent', 'HTTPie/0.8.0')
                .expect(401)
                .end(function(err, res) {
                    res.should.have.status(401);
                    done();
                });
        });
    });

    it('DELETE ' + app.get('apiPath') + '/users/:id returns not found when user does not exists', function (done) {
        getToken(function() {
            request(app)
                .del(app.get('apiPath') + '/users/' + firstUser.username + 'not')
                .set('Host', 'localhost:8080')
                .set('Accept-Encoding', 'gzip, deflate, compress')
                .set('Accept', 'application/json')
                .set('User-Agent', 'HTTPie/0.8.0')
                .set('Authorization', 'Bearer ' + token)
                .expect(404)
                .end(function(err, res) {
                    res.should.have.status(404);
                    done();
                });
        });
    });

    it('DELETE ' + app.get('apiPath') + '/users/:id should delete user', function (done) {
        getToken(function() {
            request(app)
                .del(app.get('apiPath') + '/users/' + firstUser.username)
                .set('Host', 'localhost:8080')
                .set('Accept-Encoding', 'gzip, deflate, compress')
                .set('Accept', 'application/json')
                .set('User-Agent', 'HTTPie/0.8.0')
                .set('Authorization', 'Bearer ' + token)
                .expect(200)
                .end(function(err, res) {
                    res.should.have.status(200);
                    done();
                });
        });
    });
});