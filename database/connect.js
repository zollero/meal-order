/**
 * 连接数据库
 */

'use strict';

var mongoose = require('mongoose'),
    dbSettings = require('./settings');


mongoose.connect(dbSettings.URL);

var db = mongoose.connection;

db.on('error', console.error.bind(console, '连接错误：'));
db.once('open', function (callback) {
    console.log('MongoDB 连接成功');
});

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String
});

var UserModel = db.model('food_user', UserSchema, 'food_user');


module.exports = UserModel;

