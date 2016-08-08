
var express = require('express');
var path = require('path');
var app = express();
var server = app.listen(3000, listenHandler);
var io = require('socket.io')(server);
var router = require('./routes/index');

//监听socket连接
io.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    //监听添加选菜事件
    socket.on('addMeal', function (data) {
        console.log(data);
    });

    socket.on('deleteMeal', function (data) {
       console.log(data);
    });
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);

function listenHandler() {
    console.log('Server started on port 3000');
}
