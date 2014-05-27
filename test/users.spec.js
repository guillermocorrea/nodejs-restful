/**
 * Created by EXTIGLGCORREAG on 19/05/2014.
 */
'use strict';
/*jslint unparam: true, indent: 4 */
/*jshint indent:4 */
/* jshint -W030 */
var UserModel = require('../src/backend/models/users').UserModel;
var should = require('should');

describe('UserModel', function () {
    it('set Password', function (done) {
        var User = new UserModel();
        var password = 'secret-password';
        User.password = password;
        (User.salt !== null).should.be.true;
        (User.hashedPassword !== true).should.be.true;
        User.password.should.be.equal(password);
        done();
    });
    it('#checkPassword()', function (done) {
        var User = new UserModel();
        var password = 'secret-password';
        User.password = password;
        User.checkPassword(password).should.be.true;
        User.checkPassword('another-password').should.be.false;
        done();
    });
    it('#getId()', function (done) {
        var User = new UserModel();
        (User.userId !== null).should.be.true;
        done();
    });
});