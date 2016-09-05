/**
 * 项目启动文件
 * 包含：路由及系统配置
 */
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var server = app.listen(3000, listenHandler);
var io = require('socket.io')(server);
var router = require('./routes/index');


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser('bear'));


//采用connect-mongodb中间件作session存储
var session = require('express-session'),
    Settings = require('./database/settings'),
    MongoStore = require('connect-mongodb'),
    db = require('./database/msession');

// session配置
app.use(session({
    cookie: { maxAge: 30000 },
    secret: Settings.COOKIE_SECRET,
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
        username: Settings.NAME,
        password: Settings.PASSWORD,
        db: db
    })
}));

app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    var err = req.session.error;
    delete req.session.error;
    res.locals.message = '';
    if (err) {
        res.locals.message = '<div class="alert alert-warning">' + err + '</div>';
    }
    next();
});

//监听socket连接
// var ioSocket = io.on('connection', function (socket) {
//     socket.emit('news', { hello: 'world' });
//     //监听添加选菜事件
//     socket.on('addMeal', function (data) {
//         console.log(data);
//         ioSocket.emit('someOneAddMeal', data);
//     });
//
//     socket.on('deleteMeal', function (data) {
//         console.log(data);
//         ioSocket.emit('someOneDeleteMeal', data);
//     });
// });

app.use('/', router);
app.use('/login', router);
app.use('/home', router);
app.use('/logout', router);

function listenHandler() {
    console.log('Server started on port 3000');
}
