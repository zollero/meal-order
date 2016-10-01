
'use strict';

var express = require('express');
var router = express.Router();
var db = require('../database/model');

var menuRouter = require('./menuRouter');
var teamRouter = require('./teamRouter');
var orderRouter = require('./orderRouter');
var homeRouter = require('./homeRouter');

router.get('/', function (req, res) {
    res.redirect('/home');
});

router.get('/menu/all', function (req, res, next) {
    // var mealMenu = JSON.parse(fs.readFileSync(path.join(__dirname, '../menu/meal.json'), 'utf-8'));
    res.send({menus: []});
});

router.route('/login')
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
        console.log(result);
        if (result.length === 1) {
            req.session.user = user;
            res.redirect('/home');
        } else {
            req.session.error = '用户名或密码不正确';
            res.redirect('/login');
        }
    });
});

//注册用户时，检查用户名是否唯一
router.get('/checkUniqueUsername', function (req, res) {
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
router.route('/register').get(function (req, res) {
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

router.get('/logout', function (req, res) {
    req.session.user = null;
    res.redirect('/login');
});

router.all(['/home', '/home/*'], homeRouter);

router.all(['/team', '/team/*'], teamRouter);

router.all(['/menu', '/menu/*'], menuRouter);

router.all(['/order', '/order/*'], orderRouter);


module.exports = router;