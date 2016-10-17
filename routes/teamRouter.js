/**
 * 团队页路由管理
 */

'use strict';

let express = require('express');
let router = express.Router();
let db = require('../database/model');
let util = require('./routerUtil');

router.get('/team', function (req, res) {
    if (!util.authentication(req, res)) return;
    let username = req.session.user.username;
    //应该是获取团队成员包含该角色的团队
    let queryObj = {
        members: username,  //匹配所有团队成员中包含当前用户的团队
        isDeleted: false
    };
    let outObj = {
        teamName: 1,
        creatorName: 1
    };

    db.teamModel.find(queryObj, outObj, (err, result) => {
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

    res.render('team-info', {
        title: '创建团队',
        nav: 'team',
        username: req.session.user.username
    })
});
router.post('/team/add', (req, res) => {
    if (!util.authentication(req, res)) return;
    let userName = req.session.user.username;
    let teamInfo = req.body;
    let teamId = req.body.teamId;

    if (teamId) {
        delete teamInfo.teamId;
        teamInfo.updaterName = userName;
        teamInfo.updateTime = new Date();

        db.teamModel.update({_id: teamId}, {$set: teamInfo}, (err) => {
            if (err) {
                res.send({
                    success: false,
                    message: '更新菜单失败，请稍后重试！'
                });
                return false;
            }
            res.send({
                success: true,
                message: '更新成功！'
            });
        });
    } else {
        teamInfo.ordering = false;
        teamInfo.isDeleted = false;
        teamInfo.creatorName = userName;
        teamInfo.createTime = new Date();
        teamInfo.updaterName = userName;
        teamInfo.updateTime = new Date();

        new db.teamModel(teamInfo).save((err, data) => {
            if (err) {
                res.send({
                    success: false,
                    message: '创建失败'
                });
                return false;
            }
            res.send({
                success: true,
                message: '创建成功'
            });
        });
    }
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
    let outObj = {
        menuName: 1
    };
    db.menuModel.find(queryObj, outObj, (err, result) => {
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

//编辑团队信息
router.get('/team/edit', (req, res) => {
    if (!util.authentication(req, res)) return;
    let teamId = req.query.teamId;
    let outObj = {
        teamName: 1,
        teamDesc: 1,
        members: 1,
        menus: 1
    };
    db.teamModel.find({_id: teamId, isDeleted: false}, outObj, (err, result) => {
        if (err) {
            res.send({
                success: false,
                message: '操作失败'
            });
            return false;
        }
        res.render('team-info', {
            title: '团队-编辑团队',
            username: req.session.user.username,
            nav: 'team',
            teamInfo: result[0]
        });
    });
});

//删除团队
router.post('/team/del', (req, res) => {
    if (!util.authentication(req, res)) return;

    let teamId = req.body.teamId;

    db.teamModel.update({_id: teamId}, {$set: {isDeleted: true}}, (err) => {
        res.send({
            success: !err,
            message: !err ? '操作成功' : '操作失败'
        });
    });
});

//获取团队列表
router.get('/team/getTeamList', (req, res) => {
    if (!util.authentication(req, res)) return;
    let username = req.session.user.username;
    let queryKey = req.query.keyword;

    db.teamModel.find({ teamName: queryKey, isDeleted: false }, {teamName: 1, creatorName: 1, members: 1}, (err, result) => {
        if (err) {
            res.send({
                success: false,
                message: '请求报错'
            });
            return false;
        }

        let teamList = result.map((value) => {
            return {
                teamId: value._id,
                teamName: value.teamName,
                creatorName: value.creatorName,
                in: value.members.indexOf(username) !== -1
            };
        });

        res.send({
            success: true,
            message: '操作成功',
            list: teamList
        });
    });
});

//加入团队
router.post('/team/join', (req, res) => {
    if (!util.authentication(req, res)) return;
    let username = req.session.user.username;
    let teamId = req.body.teamId;
    let updateObj = {
        $push:{
            members: username
        },
        $set: {
            updaterName: username,
            updateTime: new Date()
        }
    };

    db.teamModel.update({_id: teamId}, updateObj, (err) => {
        res.send({
            success: !err,
            message: !err ? '操作成功' : '操作失败'
        });
    });
});


module.exports = router;