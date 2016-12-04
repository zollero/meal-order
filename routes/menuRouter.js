
'use strict';

let express = require('express');
let router = express.Router();
let db = require('../database/model');
let util = require('./routerUtil');


/**
 * 餐单管理页面
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
            title: '餐单页',
            username: userName,
            menuList: result,
            nav: 'menu'
        });
    });
});

//创建餐单
router.route('/menu/add').get(function (req, res) {
    if (!util.authentication(req, res)) return;
    res.render('menu-info', {
        title: '餐单-创建餐单',
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
        }, (err) => {
            if (err) {
                res.send({
                    success: false,
                    message: '更新餐单失败，请稍后重试！'
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
                    message: '创建餐单失败，请稍后重试！'
                });
                return false;
            }
            res.send({
                success: true,
                message: '餐单“' + req.body.menuName + '”创建成功！'
            });
        });
    }
});

//编辑餐单
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
            title: '餐单-编辑餐单',
            username: req.session.user.username,
            nav: 'menu',
            menuInfo: result[0]
        });
    });
});

//删除餐单
router.post('/menu/del', (req, res) => {
    if (!util.authentication(req, res)) return;
    let menuId = req.body.menuId;
    //首先判断，如果该餐单已经被未删除的团队引用，则该餐单不能删除
    db.teamModel.find({ 'menus.menuId': menuId, isDeleted: false }, (error, result) => {
        if (error) {
            res.send({ success: false, message: '操作失败' });
            return false;
        }
        if (result.length > 0) {
            res.send({ success: false, message: '该餐单有关联团队，不能删除' });
            return false;
        }
        db.menuModel.update({_id: menuId}, {$set: {isDeleted: true}}, (err) => {
            res.send({
                success: !err,
                message: !err ? '操作成功' : '操作失败'
            });
        });
    });
});

module.exports = router;