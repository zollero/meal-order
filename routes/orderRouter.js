

'use strict';

let express = require('express');
let router = express.Router();
let db = require('../database/model');
let util = require('./routerUtil');

router.get('/order', function (req, res) {
    if (!util.authentication(req, res)) return;
    res.render('order', {
        title: '订单页',
        username: req.session.user.username,
        nav: 'order'
    });
});


module.exports = router;