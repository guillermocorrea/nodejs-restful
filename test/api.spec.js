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

before(function (done) {
    //function seedDb(callback) {
        UserModel.remove({}, function(err) {
            var user = new UserModel({ username: "andrey", password: "simplepassword" });
            user.save(function(err, user) {
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
        //callback();
    //}

    /*function getToken() {
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
                done();
            });
    }*/

    //seedDb(getToken);
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
            callback();
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
});

describe('API /users', function () {
    it('GET ' + app.get('apiPath') + '/users requires authentication', function (done) {
        request(app)
            .get(app.get('apiPath') + '/users')
            .expect(401, done);
    });

    it('GET ' + app.get('apiPath') + '/users returns users', function (done) {
        getToken(function() {
            console.log(token);
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
});