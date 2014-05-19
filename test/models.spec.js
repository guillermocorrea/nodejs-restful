/**
 * Created by guillermo on 18/05/2014.
 */
/* jshint -W030 */
var UserModel = require('../src/backend/models/users').UserModel;
var should = require('should');
var util = require('./utils');
var config = require('../src/backend/config');
var faker = require('Faker');
var Mongoose = require('mongoose');
Mongoose.connect(config.db.test);

describe('UserModel', function () {
    it('It should create users', function (done) {
        var user = new UserModel({ username: faker.random.first_name().toLowerCase(), password: faker.Lorem.words(1)[0] });
        user.save(function(err, user) {
            console.log("New user - %s:%s",user.username,user.password);
            (err === null).should.be.true;
            done();
        });
    });

});
