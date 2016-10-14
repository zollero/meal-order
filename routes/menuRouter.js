
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
            res.send({
                success: false,
                message: '请求失败'
            });
            return false;
        }
        res.render('menu', {
            title: '菜单页',
            username: userName,
            menuList: result,
            nav: 'menu'
        });
    });
});

//创建菜单
router.route('/menu/add').get(function (req, res) {
    if (!util.authentication(req, res)) return;
    res.render('menu-info', {
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

    let menuId = req.body.menuId;
    if (menuId) {
        db.menuModel.update({_id: menuId, isDeleted: false}, {
            $set: {
                menuName: req.body.menuName,
                dishes: req.body.dishes,
                updaterName: userName,
                updateTime: new Date()
            }
        }, (err, result) => {
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
    }
});

//编辑菜单
router.get('/menu/edit', (req, res) => {
    if (!util.authentication(req, res)) return;
    let queryObj = {
        _id: req.query.menuId, isDeleted: false
    };
    let outObj = {
        menuName: 1,
        dishes: 1
    };
    db.menuModel.find(queryObj, outObj, (err, result) => {
        if (err) {
            res.send({
                success: false,
                message: '操作失败'
            });
            return false;
        }
        res.render('menu-info', {
            title: '菜单-编辑菜单',
            username: req.session.user.username,
            nav: 'menu',
            menuInfo: result[0]
        });
    });
});

module.exports = router;