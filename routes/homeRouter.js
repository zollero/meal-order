
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
        creatorName: 1
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

module.exports = router;