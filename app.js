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
const PORT = process.env.NODE_ENV === 'prod' ? 80: 3000;
const server = app.listen(PORT, listenHandler);
const io = require('socket.io')(server);
const router = require('./routes/index');
// const routerUtil = require('./routes/routerUtil');
const foodDB = require('./database/model');

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
let submitMembersOfOrder = {};
let submitterOfOrder = {};
let submittingTime = {};
let joinedMembersOfOrder = {};

let meal = io.of('/meal');
// io.use((socket, next) => {
//     if (routerUtil.authentication())
// });
meal.on('connection', socket => {
    //TODO 使用meal.use(fn)添加一个中间件，对登录进行校验

    const currentUserSocketId = socket.client.nsps['/meal'].id;
    //获取socket url上的参数
    let socketParams = socket.client.conn.request._query;
    //获取orderId，由于orderId是唯一的，所以满足每个订单一个socket room
    const orderId = socketParams.orderId;
    const username = socketParams.username;

    //校验当前订单的状态是否是未完成（进行中），若不是，则不进行任何操作
    foodDB.orderModel.findOne({
        isDeleted: false,
        _id: orderId,
        status: 0
    }, (err, data) => {
        if (err) return false;
        if (!data) return false;
        //有该有效订单，则可进行操作
        if (!dishesOfMeal[orderId]) {
            dishesOfMeal[orderId] = [];
            submitMembersOfOrder[orderId] = [];
            joinedMembersOfOrder[orderId] = [];
        }
        console.log(username);
        if (joinedMembersOfOrder[orderId].indexOf(username) == -1) {
            joinedMembersOfOrder[orderId].push(username);
        }

        //加入一个room
        socket.join(orderId);
        //通知，有人加入了点菜
        meal.to(orderId).emit('message', {
            type: 'info',
            message: username + ' 加入点菜队伍'
        });

        //当用户连接的时候，如果当前团队已经选择了菜，则将已选择的菜发送给该用户，进行一些初始化的数据展示
        if (dishesOfMeal[orderId].length > 0) {
            socket.emit('selected-dishes', dishesOfMeal[orderId]);
        }
        //如果当前订单处于"确认订单"的时候，则想该用户
        if (submitterOfOrder[orderId]) {
            const diffTime = Math.floor(((new Date()).getTime() - submittingTime[orderId].getTime()) / 1000);
            socket.emit('confirm-order', {
                submitUser: submitterOfOrder[orderId],
                dishes: dishesOfMeal[orderId],
                timeCount: diffTime
            });
        }

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

        socket.on('disconnect', (ss) => {
            socket.leave(orderId);
            //通知,某人离开了房间
            meal.to(orderId).emit('message', {
                type: 'info',
                message: username + ' 离开了点菜队伍'
            });
            // if (submitterOfOrder[orderId]) {
            //     checkOrderAllAccept(orderId, username);
            // }
        });

        socket.on('submit-order', result => {
            submitterOfOrder[orderId] = result.user;
            submittingTime[orderId] = new Date();
            meal.to(orderId).emit('confirm-order', {
                submitUser: result.user,
                dishes: dishesOfMeal[orderId]
            });
        });

        socket.on('retreat-order', data => {
            submitterOfOrder[orderId] = null;
            submittingTime[orderId] = null;
            meal.to(orderId).emit('message', {
                type: 'danger',
                message: data.user + '拒绝提交订单！'
            });
            meal.to(orderId).emit('submit-failed');
            submitMembersOfOrder[orderId] = [];
        });
        socket.on('accept-order', data => {
            submitMembersOfOrder[orderId].push(currentUserSocketId);
            meal.to(orderId).emit('message', {
                type: 'success',
                message: data.user + '同意提交订单！'
            });
            checkOrderAllAccept(orderId, username);
        });
    });
});

/**
 * 有成员同意或者离开房间的时候，将同意的成员统计起来，与当前room内所有成员进行对比
 * 若当前所有成员都同意之后，则向客户端发送事件，自动提交订单，并使客户端
 * @param orderId
 * @param username
 */
const checkOrderAllAccept = function (orderId, username) {
    meal.to(orderId).clients((err, clients) => {
        if (err) throw err;
        const allAccepted = clients.every(v => {
            return submitMembersOfOrder[orderId].indexOf(v) !== -1;
        });
        if (allAccepted) {
            console.log(dishesOfMeal[orderId]);
            let orderTotal = 0;
            for (let i = 0; i < dishesOfMeal[orderId].length; i++) {
                let dish = dishesOfMeal[orderId][i];
                if (typeof dish.price === 'number' && typeof dish.no === 'number') {
                    orderTotal += dish.price * dish.no;
                }
            }
            //全部同意提交订单，修改订单的状态，并给所有成员发送已提交通知
            foodDB.orderModel.update({_id: orderId}, {
                $set: {
                    dishes: dishesOfMeal[orderId],
                    total: orderTotal,
                    status: 1,
                    members: joinedMembersOfOrder[orderId],
                    updaterName: username,
                    updateTime: new Date()
                }
            }, (err, result) => {
                if (err) throw err;
                meal.to(orderId).emit('message', {
                    type: 'success',
                    message: '全部同意提交订单，订单已生成！'
                });
                meal.to(orderId).emit('submit-success');
                submitMembersOfOrder[orderId] = [];
                joinedMembersOfOrder[orderId] = [];
                dishesOfMeal[orderId] = [];
                submitterOfOrder[orderId] = null;
                submittingTime[orderId] = null;
            });
        }
    });
};

function listenHandler() {
    console.log('Server started on port ' + PORT);
}
