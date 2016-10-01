

'use strict';

var express = require('express');
var router = express.Router();
var db = require('../database/model');
var util = require('./routerUtil');

router.get('/team', function (req, res) {
    if (!util.authentication(req, res)) return;
    res.render('team', {
        title: '团队页',
        username: req.session.user.username,
        nav: 'team'
    });
});


module.exports = router;