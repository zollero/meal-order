
'use strict';

let express = require('express');
let router = express.Router();
let db = require('../database/model');
let util = require('./routerUtil');

router.get('/order', function (req, res) {
    if (!util.authentication(req, res)) return;
    const username = req.session.user.username;

    db.orderModel.find({
        isDeleted: false,
        members: username,
        status: {$ne: 0}
    }, {
        creatorName: 1,
        updateTime: 1,
        status: 1
    }, (err, result) => {
        if (err) throw err;
        result = result.map(function (v) {
            v.time = util.dateFormat(v.updateTime);
            v.statusStr = util.formatOrderStatus(v.status);
            return v;
        });
        res.render('order', {
            title: '订单页',
            username: req.session.user.username,
            nav: 'order',
            list: result
        });
    });
});


module.exports = router;