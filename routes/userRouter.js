

'use strict';

var express = require('express');
var router = express.Router();
var db = require('../database/model');


router.route('/user/login')
    .get(function (req, res) {
        res.render('login', {title: '食'})
    }).post(function (req, res) {
    var user = {
        username: req.body.name,
        password: req.body.password,
        isDeleted: false
    };
    //从数据库中查询用户，若成功则跳转至主页
    db.userModel.find(user, function (err, result) {
        if (err) return console.error(err);
        if (result.length === 1) {
            req.session.user = user;
            res.redirect('/home');
        } else {
            req.session.error = '用户名或密码不正确';
            res.redirect('/user/login');
        }
    });
});

//注册用户时，检查用户名是否唯一
router.get('/user/checkUniqueUsername', function (req, res) {
    var username = req.query.username;
    db.userModel.find({ username: username}, function (err, result) {
        if (err) {
            res.send({
                success: false,
                message: '系统异常，请稍后再试'
            });
            return;
        }
        res.send({
            usable: result.length === 0
        });
    });
});

//注册
router.route('/user/register').get(function (req, res) {
    res.render('register', {title: '食 - 新用户注册'})
}).post(function (req, res) {
    var user = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        isDeleted: false,
        creatorName: req.body.username,
        createTime: new Date(),
        updaterName: req.body.username,
        updateTime: new Date()
    };
    db.userModel.create(user, function (err, node, numAffected) {
        if (err) {
            res.send({
                success: false,
                err: err
            });
            return;
        }
        res.send({
            success: true,
            message: '恭喜你：' + node.username + '，注册成功'
        });
    });
});

//通过用户名搜索用户，全匹配查询（非模糊查询）
router.get('/user/getUserByName', (req, res) => {
    var keyword = req.query.keyword;
    db.userModel.find({ username: keyword, isDeleted:false }, { username: 1 }, (err, result) => {
        if (err) {
            res.send({
                status: 500,
                message: '查询报错，请稍后重试'
            });
            return false;
        }
        res.send({
            status: 200,
            users: result
        });
    });
});

router.get('/user/logout', function (req, res) {
    req.session.user = null;
    res.redirect('/user/login');
});

module.exports = router;