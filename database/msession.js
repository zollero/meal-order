

var Settings = require('./settings');
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var db = new Db(Settings.DB, new Server(Settings.HOST, Settings.PORT, {
        auto_reconnect: true, native_parser: true
    }), {
       safe: false
    });

module.exports = db;