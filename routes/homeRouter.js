
'use strict';

let express = require('express');
let router = express.Router();
let db = require('../database/model');
let util = require('./routerUtil');

router.get('/home', function (req, res) {
    if (!util.authentication(req, res)) return;
    let username = req.session.user.username;

    db.teamModel.find({ isDeleted: false, ordering: true }, { teamId: 1, teamName: 1, creatorName: 1 }, (err, result) => {
        if (err) {
            res.send({
                success: false,
                message: '服务器错误'
            });
            return false;
        }
        res.render('home', {
            title: '首页',
            username: req.session.user.username,
            nav: 'home',
            list: result
        });
    });
});

//获取非点餐状态的团队列表
router.get('/home/getTeamList', (req, res) => {
    if (!util.authentication(req, res)) return;

    let username = req.session.user.username;

    db.teamModel.find({
        ordering: false,
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

//点餐页
router.get('/home/meal', (req, res) => {
    if (!util.authentication(req, res)) return;

    let username = req.session.user.username;
    let teamId = req.query.teamId;
    let teamName = req.query.teamName;
    let menuId = req.query.menuId;

    db.menuModel.find({ isDeleted: false, _id: menuId }, { menuName: 1, dishes: 1 }, (err, result) => {
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
            teamId: teamId,
            teamName: teamName,
            menuName: menu.menuName,
            dishes: menu.dishes
        };
        res.render('meal', outObj);
    });
});

module.exports = router;