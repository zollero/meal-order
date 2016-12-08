
'use strict';

let express = require('express');
let router = express.Router();
let db = require('../database/model');
let util = require('./routerUtil');

router.get('/home', function (req, res) {
    if (!util.authentication(req, res)) return;
    let username = req.session.user.username;

    db.teamModel.find({
        isDeleted: false,
        members: username
    }, { teamName: 1}, (err, result) => {
        if (err) throw err;
        let teamIds = result.map( v => {
            return v._id;
        });
        db.orderModel.find({
            isDeleted: false,
            status: 0,
            teamId: {$in: teamIds}
        }, {
            creatorName: 1,
            createTime: 1
        }, (err, result) => {
            if (err) {
                res.send({
                    success: false,
                    message: '服务器错误'
                });
                return false;
            }
            result = result.map(function (v) {
                v.time = util.dateFormat(v.createTime);
                return v;
            });
            res.render('home', {
                title: '首页',
                username: username,
                nav: 'home',
                list: result
            });
        });
    });


});

//获取所属团队列表
router.get('/home/getTeamList', (req, res) => {
    if (!util.authentication(req, res)) return;

    let username = req.session.user.username;

    db.teamModel.find({
        members: username,
        isDeleted: false
    }, {
        teamName: 1,
        creatorName: 1,
        menus: 1
    }, (err, result) => {
        if (err) {
            res.send({
                success: false,
                message: '获取团队列表失败'
            });
            return false;
        }
        res.send({
            success: true,
            message: '获取团队列表成功',
            list: result
        });
    });
});

//发起点餐活动
router.post('/home/launchOrder', (req, res) => {
    if (!util.authentication(req, res)) return;

    let username = req.session.user.username;
    let teamId = req.body.teamId,
        menuId = req.body.menuId;

    //生成一个新订单
    db.orderModel({
        teamId: teamId,
        menuId: menuId,
        dishes: [],
        members: [username],
        total: 0,
        status: 0,
        isDeleted: false,
        creatorName: username,
        createTime: new Date(),
        updaterName: username,
        updateTime: new Date()
    }).save((err, data) => {
        if (err) {
            console.error(err);
            res.send({
                success: false,
                message: '发起失败'
            })
        }
        res.send({
            success: true,
            message: '发起成功',
            orderId: data._id
        });
    });
});

//点餐页
router.get('/home/meal', (req, res) => {
    if (!util.authentication(req, res)) return;

    let username = req.session.user.username;
    let orderId = req.query.orderId;

    db.orderModel.findOne({
        isDeleted: false,
        _id: orderId
    }, (err1, data) => {
        if (err1) {
            res.send({ success: false, message: '操作失败' });
            return false;
        }
        db.menuModel.find({ isDeleted: false, _id: data.menuId }, { menuName: 1, dishes: 1 }, (err, result) => {
            if (err) {
                res.send({ success: false, message: '操作失败' });
                return false;
            }
            if (result.length === 0) {
                res.send({ success: false, message: '未发现该菜单'});
                return false;
            }
            let menu = result[0];
            let outObj = {
                username: username,
                nav: 'home',
                title: '点餐',
                menuName: menu.menuName,
                dishes: menu.dishes
            };
            res.render('meal', outObj);
        });
    });
});

module.exports = router;