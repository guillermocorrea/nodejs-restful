/**
 * Created by EXTIGLGCORREAG on 13/05/2014.
 */
'use strict';
/*jslint unparam: true, indent: 4 */
var express = require('express');
// var path = require('path');
var bodyParser = require('body-parser');
var config = require('./config');

var app = express();

app.use(bodyParser());

var port = process.env.PORT || config.server.port;

var router = express.Router();

router.get('/', function (req, res) {
    res.send(200);
});

app.use('/api/v' + config.api.latestVersion, router);
app.use('', router);

app.listen(port);
console.log('Magic happens on port: ' + port);

module.exports = app;