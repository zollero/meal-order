

'use strict';

var express = require('express');
var router = express.Router();
var db = require('../database/model');
var util = require('./routerUtil');

router.get('/order', function (req, res) {
    if (!util.authentication(req, res)) return;
    res.render('order', {
        title: '订单页',
        username: req.session.user.username,
        nav: 'order'
    });
});


module.exports = router;