/**
 * Created by guillermo on 18/05/2014.
 */
var router = require('express').Router();
var passport = require('passport');
var UserModel = require('../models/users').UserModel;

router.get('/users', passport.authenticate('bearer', { session: false }), function(req, res) {
    UserModel.find({}, function(err, users) {
        if (err) {
            res.statusCode = 400;
            return res.send(err);
        }

        res.send(users);
    });
});

router.get('/users/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    UserModel.findOne({username: req.params.id}, function(err, user) {
        if (err) {
            res.statusCode = 400;
            return res.send(err);
        }

        if (!user) {
            res.statusCode = 404;
            return res.send({message: 'User not found'});
        }

        res.send(user);
    });
});

router.post('/users', passport.authenticate('bearer', { session: false }), function(req, res) {
    var user = new UserModel({
        username: req.body.username,
        password: req.body.password
    });
    user.save(function(err) {
        if (err) {
            res.statusCode = 400;
            return res.send(err);
        }

        res.json({ message: 'User created!' });
    });
});

router.put('/users/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    // TODO: validate role
    if (req.user.username !== req.params.id) {
        res.statusCode = 403;
        return res.send({message: 'You cant do that'});
    }

    UserModel.findOneAndUpdate({username: req.params.id}, {password: req.body.password}, null, function(err, user) {
        if (err) {
            res.statusCode = 400;
            return res.send(err);
        }

        res.json({ message: 'User updated!' });
    });
});


router.delete('/users/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    // TODO: validate role
    /*if (req.user.username !== req.params.id) {
        res.statusCode = 403;
        return res.send({message: 'You cant do that'});
    }*/

    UserModel.findOne({username: req.params.id}, function(err, user) {
        if (err) {
            res.statusCode = 400;
            return res.send(err);
        }

        if (!user) {
            res.statusCode = 404;
            return res.send({message: 'Not found'});
        }

        user.remove(function() {
            res.json({ message: 'User deleted!' });
        });
    });
});
module.exports = router;