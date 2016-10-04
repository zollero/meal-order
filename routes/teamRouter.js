/**
 * 团队页路由管理
 */

'use strict';

var express = require('express');
var router = express.Router();
var db = require('../database/model');
var util = require('./routerUtil');

router.get('/team', function (req, res) {
    if (!util.authentication(req, res)) return;
    let username = req.session.user.username;

    let qureyObj = {
        creatorName: username,
        isDeleted: false
    };

    db.teamModel.find(qureyObj, (err, result) => {
        console.log(result);
        if (err) {
            return console.error(err);
        }
        res.render('team', {
            title: '团队页',
            username: username,
            nav: 'team',
            teamList: result
        });
    });
});

router.get('/team/add', (req, res) => {
    if (!util.authentication(req, res)) return;

    res.render('team-add', {
        title: '创建团队',
        nav: 'team',
        username: req.session.user.username
    })
});
router.post('/team/add', (req, res) => {
    if (!util.authentication(req, res)) return;

    //TODO 插入数据
});

/**
 * 获取当前用户创建的菜单
 */
router.get('/team/getRelatedMenu', (req, res) => {
    if (!util.authentication(req, res)) return;

    let queryObj = {
        creatorName: req.session.user.username,
        isDeleted: false
    };
    db.menuModel.find(queryObj, (err, result) => {
        if (err) {
            res.send({
                status: 500,
                message: '失败',
                menus: result
            });
           return console.error(err);
        }
        res.send({
            status: 200,
            message: '成功',
            menus: result
        });
    });
});


module.exports = router;