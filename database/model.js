/**
 * 管理数据表数据结构
 * @type {*|exports|module.exports}
 */

'use strict';

const mongoose = require('mongoose');
const db = require('./connect');

let UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    isDeleted: Boolean,
    creatorName: String,
    createTime: Date,
    updaterName: String,
    updateTime: Date
});

let MenuSchema = new mongoose.Schema({
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

let TeamSchema = new mongoose.Schema({
    teamName: String,
    teamDesc: String,
    members: [String],
    menus: [{
        menuId: String,
        menuName: String
    }],
    ordering: Boolean,
    isDeleted: Boolean,
    creatorName: String,
    createTime: Date,
    updaterName: String,
    updateTime: Date
});

let OrderSchema = new mongoose.Schema({
    teamId: String,
    menuId: String,
    dishes: [{
        dishName: String,
        price: Number,
        number: Number
    }],
    total: Number,
    status: Number,
    isDeleted: Boolean,
    creatorName: String,
    createTime: Date,
    updaterName: String,
    updateTime: Date
});

let UserModel = db.model('food_user', UserSchema, 'food_user');
let MenuModel = db.model('food_menu', MenuSchema, 'food_menu');
let TeamModel = db.model('food_team', TeamSchema, 'food_team');
let OrderModel = db.model('food_order', OrderSchema, 'food_order');

module.exports = {
    userModel: UserModel,
    menuModel: MenuModel,
    teamModel: TeamModel,
    orderModel: OrderModel
};