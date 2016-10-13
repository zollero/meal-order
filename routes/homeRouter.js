
'use strict';

var express = require('express');
var router = express.Router();
var db = require('../database/model');
var util = require('./routerUtil');

router.get('/home', function (req, res) {
    if (!util.authentication(req, res)) return;
    res.render('home', {
        title: '首页',
        username: req.session.user.username,
        nav: 'home'
    });
});

module.exports = router;