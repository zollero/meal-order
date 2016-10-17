
'use strict';

let express = require('express');
let router = express.Router();
let db = require('../database/model');
let util = require('./routerUtil');

router.get('/home', function (req, res) {
    if (!util.authentication(req, res)) return;
    let username = req.session.user.username;

    res.render('home', {
        title: '首页',
        username: req.session.user.username,
        nav: 'home'
    });
});

module.exports = router;