/**
 * Created by EXTIGLGCORREAG on 13/05/2014.
 */
'use strict';
/*jslint unparam: true, indent: 4 */
process.env.NODE_ENV = 'test';
var express = require('express');
// var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var oauth2 = require('./libs/oauth2');
var config = require('./config');
var usersRoute = require('./routes/users');
var Mongoose = require('mongoose');
var log = require('./libs/logger')(module);
var sessionParser = require('express-session');
var Path = require('path');
require('./libs/auth');

var app = express();
app.set('dbUrl', config.db[app.settings.env]);
app.set('apiPath', '/api/v' + config.api.latestVersion);
<<<<<<< HEAD
log.info('connected to: ' + app.get('dbUrl'));
// connect mongoose to the mongo dbUrl
Mongoose.connect(app.get('dbUrl'));
=======
console.log('connected to: ' + app.get('dbUrl'));
// Mongoose.connect(app.get('dbUrl'));
>>>>>>> 39da5405a249a0d680b832c635d8634223dc2f1f

var p = Path.join(__dirname, '../frontend');
console.log('__dirname: ' + p);
app.use(express.static(p));
app.use(bodyParser());
app.use(cookieParser());
app.use(sessionParser({ secret: 'shhh secret' }));
app.use(passport.initialize());
app.use(passport.session());

/*
*
* app.use(express.cookieParser());
 app.use(express.bodyParser());
 app.use(express.session({ secret: 'keyboard cat' }));
 app.use(passport.initialize());
 app.use(passport.session());
 app.use(app.router);
* */

var port = process.env.PORT || config.server.port;

var router = express.Router();

app.post('/oauth/token', oauth2.token);

router.get('/', function (req, res) {
    res.send(200);
});

app.use(app.get('apiPath'), router);
app.use(app.get('apiPath'), usersRoute);
app.use('', router);

app.listen(port);
log.info('Magic happens on port: ' + port);

module.exports = app;