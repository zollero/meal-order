
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

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
    var user = {
        name: 'admin',
        password: '123456'
    };
    console.log(req.body);
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
    res.redirect('/');
});

router.get('/home', function (req, res) {
    authentication(req, res);
    res.render('home', {
        title: '食－－首页'
    });
});

function authentication(req, res) {
    console.log(req.session);
    if (!req.session.user) {
        req.session.error = '请先登录';
        res.redirect('/login');
    }
}

module.exports = router;