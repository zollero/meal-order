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


module.exports = router;