
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

router.get('/', function (req, res) {
    res.render('index');
});

router.get('/menu/all', function (req, res, next) {
    var mealMenu = JSON.parse(fs.readFileSync(path.join(__dirname, '../menu/meal.json'), 'utf-8'));
    res.send({menus: mealMenu});
});



module.exports = router;