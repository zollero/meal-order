
var express = require('express');
var path = require('path');
var app = express();
var router = require('./routes/index');


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);

app.listen(3000, function () {
    console.log('Server started on port 3000');
});