
var mongoose = require('mongoose');
var db = require('./connect');

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    isDeleted: Boolean,
    creatorName: String,
    createTime: Date,
    updaterName: String,
    updateTime: Date
});

var MenuSchema = new mongoose.Schema({
    menuName: String,
    dishes: [{
        dishName: String,
        price: Number
    }],
    isDeleted: Boolean,
    creatorName: String,
    createTime: Date,
    updaterName: String,
    updateTime: Date
});

var TeamSchema = new mongoose.Schema({
    teamName: String,
    teamDesc: String,
    members: Array,
    menus: Array,
    isDeleted: Boolean,
    creatorName: String,
    createTime: Date,
    updaterName: String,
    updateTime: Date
});

var UserModel = db.model('food_user', UserSchema, 'food_user');
var MenuModel = db.model('food_menu', MenuSchema, 'food_menu');
var TeamModel = db.model('food_team', TeamSchema, 'food_menu');

module.exports = {
    userModel: UserModel,
    menuModel: MenuModel,
    teamModel: TeamModel
};