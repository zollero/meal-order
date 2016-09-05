

var mongodb = require('mongodb'),
    db = require('./msession');


db.open(function (err, client) {
    if(err) throw err;
    mudule.exports = client;
});
