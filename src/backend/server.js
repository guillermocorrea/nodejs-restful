/**
 * Created by EXTIGLGCORREAG on 13/05/2014.
 */
'use strict';
/*jslint unparam: true, indent: 4 */
var express = require('express');
// var path = require('path');
var bodyParser = require('body-parser');
var passport = require('passport');
var oauth2 = require('./libs/oauth2');
var config = require('./config');
var usersRoute = require('./routes/users');
var Mongoose = require('mongoose');
require('./libs/auth');

var app = express();
app.set('dbUrl', config.db[app.settings.env]);
app.set('apiPath', '/api/v' + config.api.latestVersion);
console.log('connected to: ' + app.get('dbUrl'));
// connect mongoose to the mongo dbUrl
// Mongoose.connect(app.get('dbUrl'));

app.use(bodyParser());

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
console.log('Magic happens on port: ' + port);

module.exports = app;