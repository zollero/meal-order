/**
 * 项目启动文件
 * 包含：路由及系统配置
 */

'use strict';

const express = require('express');
const path = require('path');
const favicon = require('static-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
const server = app.listen(3000, listenHandler);
const io = require('socket.io')(server);
const router = require('./routes/index');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser('bear'));


//采用connect-mongodb中间件作session存储
const session = require('express-session'),
    Settings = require('./database/settings'),
    MongoStore = require('connect-mongodb'),
    db = require('./database/msession');

const mongoStore = new MongoStore({
    username: Settings.NAME,
    password: Settings.PASSWORD,
    db: db
});

// session配置
app.use(session({
    cookie: { maxAge: 1800000 },
    secret: Settings.COOKIE_SECRET,
    resave: true,
    saveUninitialized: true,
    store: mongoStore
}));

app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    const err = req.session.error;
    delete req.session.error;
    res.locals.message = '';
    if (err) {
        res.locals.message = err;
    }
    next();
});

//设置默认的路由处理函数
app.use(router);


//定义一个对象，来临时存储团队中点的菜信息
let dishesOfMeal = {};

let meal = io.of('/meal');
meal.on('connection', socket => {
    //TODO 使用meal.use(fn)添加一个中间件，对登录进行校验
    //获取socket url上的参数
    let socketParams = socket.client.conn.request._query;
    //获取orderId，由于orderId是唯一的，所以满足每个订单一个socket room
    const orderId = socketParams.orderId;
    const username = socketParams.username;
    console.log(orderId);

    if (!dishesOfMeal[orderId]) {
        dishesOfMeal[orderId] = [];
    }

    //加入一个room
    socket.join(orderId);
    //通知，有人加入了点菜
    meal.to(orderId).emit('message', username + ' 加入点菜队伍');

    //当用户连接的时候，如果当前团队已经选择了菜，则将已选择的菜发送给该用户，进行一些初始化的数据展示
    if (dishesOfMeal[orderId].length > 0) {
        socket.emit('selected-dishes', dishesOfMeal[orderId]);
    }

    //仅该room内的连接可以接收到该信息
    //meal.to(teamId).emit('hii', 'I am room:' + teamId);

    //监听“点菜”事件，并将该菜品信息发送给该room内的所有人
    socket.on('add-dish', dishInfo => {
        let dishIndex = dishesOfMeal[orderId].findIndex((value, index, attr) => {
            return value.dishId === dishInfo.dishId;
        });
        //判断该团队是否已经选择了菜，若没有选则添加到临时变量中，若选择了，则数量加1
        if (dishIndex === -1) {
            dishesOfMeal[orderId].push({
                dishId: dishInfo.dishId,
                dishName: dishInfo.dishName,
                price: dishInfo.price,
                no: 1
            });
        } else {
            dishesOfMeal[orderId][dishIndex].no++;
        }
        meal.to(orderId).emit('someone-add-dish', dishInfo);
    });

    socket.on('del-dish', dishInfo => {
        let dishIndex = dishesOfMeal[orderId].findIndex((value, index, attr) => {
            return value.dishId === dishInfo.dishId;
        });
        //判断该团队是否已经选择了菜，若没有选则不做操作，若选择了，则数量减1
        if (dishIndex !== -1) {
            if (dishesOfMeal[orderId][dishIndex].no === 1) {
                dishesOfMeal[orderId].splice(dishIndex, 1);
            } else {
                dishesOfMeal[orderId][dishIndex].no--;
            }
        }
        meal.to(orderId).emit('someone-del-dish', dishInfo);
    });

    //该namespace下所有的room中的连接都能接收到该信息
    socket.emit('hi', 'everyone!');

    socket.on('disconnect', (ss) => {
        socket.leave(orderId);
        //通知,某人离开了房间
        meal.to(orderId).emit('message', username + ' 离开了点菜队伍');
        meal.to(orderId).clients((err, clients) => {
            if (err) throw err;
            //TODO 获取所有房间内的客户端
            console.log(clients);
        });
    });
});



function listenHandler() {
    console.log('Server started on port 3000');
}
