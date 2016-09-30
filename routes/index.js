
'use strict';

var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path'),
    dbConnect = require('../database/connect');


router.get('/', function (req, res) {
    res.redirect('/home');
});

router.get('/menu/all', function (req, res, next) {
    var mealMenu = JSON.parse(fs.readFileSync(path.join(__dirname, '../menu/meal.json'), 'utf-8'));
    res.send({menus: mealMenu});
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
    dbConnect.userModel.find(user, function (err, result) {
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
    dbConnect.userModel.find({ username: username}, function (err, result) {
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
    dbConnect.userModel.create(user, function (err, node, numAffected) {
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

router.get('/home', function (req, res) {
    if (!authentication(req, res)) return;
    res.render('home', {
        title: '首页',
        username: req.session.user.username
    });
});

router.get('/team', function (req, res) {
    if (!authentication(req, res)) return;
    res.render('team', {
        title: '团队页',
        username: req.session.user.username
    });
});

/**
 * 菜单管理页面
 */
router.get('/menu', function (req, res) {
    if (!authentication(req, res)) return;
    let userName = req.session.user.username;
    let menu = {
        creatorName: userName,
        isDeleted: false
    };
    dbConnect.menuModel.find(menu, function (err, result) {
        if (err) {
            return console.error(err);
        }
        console.log(result);
        res.render('menu', {
            title: '菜单页',
            username: userName,
            menuList: result
        });
    });
});
router.route('/menu/add').get(function (req, res) {
    if (!authentication(req, res)) return;
    res.render('menu-add', {
        title: '菜单-创建菜单',
        username: req.session.user.username
    });
}).post(function (req, res) {
    if (!authentication(req, res)) return;
    let userName = req.session.user.username;
    let menuObj = {
        menuName: req.body.menuName,
        dishes: req.body.dishes,
        isDeleted: false,
        creatorName: userName,
        createTime: new Date(),
        updaterName: userName,
        updateTime: new Date()
    };

    new dbConnect.menuModel(menuObj).save(function (err, data) {
       if (err) {
           res.send({
               success: false,
               message: '创建菜单失败，请稍后重试！'
           });
           return false;
       }
        res.send({
            success: true,
            message: '菜单“' + req.body.menuName + '”创建成功！'
        });
    });
});
router.get('/order', function (req, res) {
    if (!authentication(req, res)) return;
    res.render('order', {
        title: '订单页',
        username: req.session.user.username
    });
});

/**
 * 校验用户是否登录,若未登录,则跳转到登录页面
 * @param req
 * @param res
 */
function authentication(req, res) {
    if (!req.session.user) {
        req.session.error = '请先登录';
        res.redirect('/login');
        return false;
    }
    return true;
}

module.exports = router;