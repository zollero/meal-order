
'use strict';

var express = require('express');
var router = express.Router();
var db = require('../database/model');
var util = require('./routerUtil');


/**
 * 菜单管理页面
 */
router.get('/menu', function (req, res) {
    if (!util.authentication(req, res)) return;
    let userName = req.session.user.username;
    let menu = {
        creatorName: userName,
        isDeleted: false
    };
    db.menuModel.find(menu, function (err, result) {
        if (err) {
            return console.error(err);
        }
        console.log(result);
        res.render('menu', {
            title: '菜单页',
            username: userName,
            menuList: result,
            nav: 'menu'
        });
    });
});
router.route('/menu/add').get(function (req, res) {
    if (!util.authentication(req, res)) return;
    res.render('menu-add', {
        title: '菜单-创建菜单',
        username: req.session.user.username,
        nav: 'menu'
    });
}).post(function (req, res) {
    if (!util.authentication(req, res)) return;
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

    new db.menuModel(menuObj).save(function (err, data) {
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

module.exports = router;