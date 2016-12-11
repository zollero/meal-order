
'use strict';

let express = require('express');
let router = express.Router();
let db = require('../database/model');
let util = require('./routerUtil');

router.get('/order', (req, res) => {
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
    }).sort({ updateTime: -1 });
});


router.get('/order/getOrderDetail', (req, res) => {
    if (!util.authentication(req, res)) return;
    const username = req.session.user.username;
    const orderId = req.query.orderId;

    db.orderModel.findOne({
        _id: orderId,
        isDeleted: false,
        members: username
    }, {
        dishes: 1,
        members: 1,
        total: 1
    }, (err, result) => {
        if (err) {
            res.send({
                success: false,
                message: '获取详情失败'
            });
            return false;
        }
       res.send({
           success: true,
           message: '获取详情成功',
           result: result
       });
    });
});


module.exports = router;