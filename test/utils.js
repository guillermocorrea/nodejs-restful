/**
 * Created by guillermo on 18/05/2014.
 */
'use strict';

/*
 * Modified from https://github.com/elliotf/mocha-Mongoose
 */

var config = require('../src/backend/config');
var Mongoose = require('mongoose');

// ensure the NODE_ENV is set to 'test'
// this is helpful when you would like to change behavior when testing
process.env.NODE_ENV = 'test';

before(function (done) {
    /*function doneRemovingConnection() {}
    function clearDB() {
        for (var i in Mongoose.connection.collections) {
            Mongoose.connection.collections[i].remove(doneRemovingConnection);
        }

        return done();
    }

    function reconnect() {
        Mongoose.connect(config.db.test, function (err) {
            if (err) {
                throw err;
            }

            return clearDB();
        });
    }

    function checkState() {
        switch (Mongoose.connection.readyState) {
            case 0:
                reconnect();
                break;
            case 1:
                clearDB();
                break;
            default:
                process.nextTick(checkState);
        }
    }

    checkState();*/
    done();
});

afterEach(function (done) {
    /*if (Mongoose.connection.db) {
        Mongoose.connection.db.dropDatabase(function(err, results) {
            console.log('dropped database');
        });
        Mongoose.disconnect();
    }*/
    return done();
});