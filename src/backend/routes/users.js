/**
 * Created by guillermo on 18/05/2014.
 */
var router = require('express').Router();
var passport = require('passport');
var UserModel = require('../models/users').UserModel;

router.get('/users', passport.authenticate('bearer', { session: false }), function(req, res) {
    UserModel.find({}, function(err, users) {
       res.send(users);
    });
});

module.exports = router;