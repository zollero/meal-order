
let express = require('express');
let router = express.Router();

// let http = require('http');
let fs = require('fs');
let path = require('path');

router.get('/', function (req, res, next) {
    var mealMenu = JSON.parse(fs.readFileSync(path.join(__dirname, '../menu/meal.json'), 'utf-8'));
    console.log(typeof mealMenu);
    res.render('index', {menus: mealMenu});
});

module.exports = router;