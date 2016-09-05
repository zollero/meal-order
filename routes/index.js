
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path'),
    mongodb = require('mongodb'),
    db = require('../database/msession'),
    connectClient = require('../database/connect');


router.get('/', function (req, res) {
    // res.render('index');
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

    // db.open(function (err, client) {
    //     if(err) throw err;
    //     var collection = new mongodb.Collection(client, 'food_user');
    //     collection.find({
    //         username: req.body.name,
    //         password: req.body.password
    //     }).toArray(function (err, docs) {
    //         console.log(docs);
    //
    //     });
    //
    // });

    // var collection = new mongodb.Collection(connectClient, 'food_user');
    // collection.find({
    //     username: req.body.name,
    //     password: req.body.password
    // }).toArray(function (err, docs) {
    //     console.log(docs);
    // });

    var user = {
        name: 'admin',
        password: '123456'
    };
    // console.log(req.body);
    if (req.body.name === user.name && req.body.password === user.password) {
        console.log('success');
        req.session.user = user;
        res.redirect('/home');
    } else {
        console.log('error');
        req.session.error = '用户名或密码不正确';
        res.redirect('/login');
    }
});

router.get('/logout', function (req, res) {
    req.session.user = null;
    res.redirect('/login');
});

router.get('/home', function (req, res) {
    authentication(req, res);
    res.render('home', {
        title: '食－－首页'
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
    }
}

module.exports = router;