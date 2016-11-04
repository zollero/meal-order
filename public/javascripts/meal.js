

;(function (window, document, $) {
    'use strict';

    var DISH_LINE_HEIGHT = 45;

    var USER_NAME = $('#username').text();

    var dishListEle = $('#dish-list'),
        addDishBtn = $('.add-dish-btn'),
        basketInfo = $('#basket-info'),
        cartBasket = $('#cart-basket')[0],
        submitBtn = $('#submit-meal-btn');

    //弹出提示的样式类
    var messageObjs = {
        success: {
            className: 'dis-message-success',
            iconClassName: 'glyphicon-ok-sign'
        },
        info: {
            className: 'dis-message-info',
            iconClassName: 'glyphicon-info-sign'
        },
        warning: {
            className: 'dis-message-warning',
            iconClassName: 'glyphicon-exclamation-sign'
        },
        danger: {
            className: 'dis-message-danger',
            iconClassName: 'glyphicon-minus-sign'
        }
    };

    var urlParams = urlSearch2Obj(window.location.search);

    //var addMealURL = '/meal/' + urlParams.teamId;
    var addMealURL = '/meal?teamId=' + urlParams.teamId;

    /**
     * TODO
     * 1. 添加一个弹出提示的消息样式
     * 2. server端编写针对不同的订餐任务的socket链接，以团队ID为标识
     * 3. client端传不同的参数在url上，与server连接
     */

    //TODO  需要对后面进入的用户，自动将之前选好的菜品初始化
    //TODO  需要重新设计一个点餐的数据表，来记录点餐的数据

    var mealSocket = io(addMealURL);


    //监听其他人点菜的事件
    mealSocket.on('someone-add-dish', function(data) {
        console.log('someone-add-dish', data);
        showMessage('success', '<span class="text-danger">' + data.username + '</span> 点了一份 <span class="text-danger">' + data.dishName + '</span>');
        addDishHandler(data);
    });

    //监听其他人取消点菜的事件
    mealSocket.on('someone-del-dish', function(data) {
        console.log('someone-add-dish', data);
        showMessage('danger', '<span class="text-danger">' + data.username + '</span> 减掉了一份 <span class="text-danger">' + data.dishName + '</span>');
        delDishHandler(data);
    });

    //发送点菜事件至服务器端
    function emitAddDishEvent(dishInfo) {
        mealSocket.emit('add-dish',dishInfo);
    }
    //发送取消点菜事件至服务器端
    function emitDelDishEvent(dishInfo) {
        mealSocket.emit('del-dish', dishInfo);
    }

    basketInfo.on('click', function() {
        var cartBasketHeight = cartBasket.clientHeight;
        var cartBasketTop = cartBasket.style.top;
        if (cartBasketTop === '0px' || cartBasketTop === '') {
            cartBasket.style.top = cartBasketHeight + 'px';
            cartBasket.style.height = '0px';
        } else {
            cartBasket.style.top = '0px';
            cartBasket.style.height = 'auto';
        }
    });

    submitBtn.on('click', function(e) {
        e.preventDefault();
        console.log(111);
    });

    addDishBtn.on('click', function() {
        var dataTarget = $(this).parent();
        var dishId = dataTarget.attr('dish-id'),
            dishName = dataTarget.attr('dish-name'),
            dishPrice = Number(dataTarget.attr('dish-price'));

        //emit一个事件给当前点餐的其他人
        emitAddDishEvent({
            username: USER_NAME,
            dishId: dishId,
            dishName: dishName,
            price: dishPrice
        });
    });

    function addDishHandler(dishInfo) {
        var thisDishLine = dishListEle.find('.dish-line[dish-id=' + dishInfo.dishId + ']');
        if (thisDishLine.length === 0) {
            var basketLine = '<div class="dish-line" dish-id="' + dishInfo.dishId + '" dish-name="' + dishInfo.dishName + '" dish-price="' + dishInfo.price + '">' +
                '<div class="dish-name">' + dishInfo.dishName + '</div>' +
                '<div class="ope-btns"><button type="button" class="minus-btn">-</button>' +
                '<input type="text" readonly class="selected-no" value="1" />' +
                '<button type="button" class="plus-btn">+</button></div>' +
                '<div class="total-price">¥' + dishInfo.price + '</div></div>';
            thisDishLine = dishListEle.append(basketLine).find('.dish-line[dish-id=' + dishInfo.dishId + ']');
            //给增加和减少按钮添加事件处理函数
            initMPEvent(thisDishLine);
            resizeDishListHeight();
        } else {
            var selectedNoEle = thisDishLine.find('.selected-no'),
                selectedNo = Math.floor(Number(selectedNoEle.val())) + 1;
            var thisTotalPriceEle = thisDishLine.find('.total-price');
            selectedNoEle.val(selectedNo);
            thisTotalPriceEle.text('¥' + selectedNo * Number(dishInfo.price));
        }
        refreshTotalDishesInfo();
    }

    function delDishHandler(dishInfo) {
        var thisDishLine = dishListEle.find('.dish-line[dish-id=' + dishInfo.dishId + ']');
        if (thisDishLine.length !== 0) {
            var selectedNoEle = thisDishLine.find('.selected-no'),
                totalPriceEle = thisDishLine.find('.total-price');
            var value = Number(selectedNoEle.val()) - 1;
            if (value > 0) {
                selectedNoEle.val(value);
                totalPriceEle.text('¥' + value * dishInfo.price);
            } else {
                thisDishLine.remove();
                resizeDishListHeight();
            }
            refreshTotalDishesInfo();
        }
    }

    function initMPEvent(target) {
        var selectedNoEle = target.find('.selected-no'),
            totalPriceEle = target.find('.total-price'),
            dishId = target.attr('dish-id'),
            dishName = target.attr('dish-name'),
            dishPrice = Number(target.attr('dish-price'));
        target.find('.minus-btn').on('click', function() {
            //emit事件给其他人，减少了一个菜
            emitDelDishEvent({
                username: USER_NAME,
                dishId: dishId,
                dishName: dishName,
                price: dishPrice
            });
        });
        target.find('.plus-btn').on('click', function() {
            //emit事件给其他人，添加了一个菜
            emitAddDishEvent({
                username: USER_NAME,
                dishId: dishId,
                dishName: dishName,
                price: dishPrice
            });
        });
    }

    function resizeDishListHeight() {
        dishListEle[0].style.height = dishListEle.find('.dish-line').length * DISH_LINE_HEIGHT + 'px';
    }

    function refreshTotalDishesInfo() {
        var dishLines = dishListEle.find('.dish-line').toArray();
        var totalNo = 0;
        var totalPrice = 0;
        $.each(dishLines, function(i, v) {
            var dishNo = Number($(v).find('.selected-no').val());
            var price = Number($(v).attr('dish-price'));
            totalNo += dishNo;
            totalPrice += dishNo * price;
        });
        totalNo = totalNo > 99 ? '99+' : totalNo;
        basketInfo.find('.badge').text(totalNo);
        basketInfo.find('.total-price').text(totalPrice);
    }

    function showMessage(type, message) {
        var messageContainer = document.querySelector('.dis-message-container');
        var messageEle,
            messageObj = messageObjs[type] ? messageObjs[type] : messageObjs['info'],
            thisMessageEle;

        messageEle = '<li class="dis-message ' + messageObj.className + '">' +
            '<span class="dis-message-status glyphicon ' + messageObj.iconClassName + '"></span>' +
            '<div class="essage-text">' + message + '</div> <a class="dis-message-close">' +
            '<span class="glyphicon glyphicon-remove-sign"></span></a></li>';

        if (!messageContainer) {
            messageEle = '<ul class="dis-message-container">' + messageEle + '</ul>';
            $('body').append(messageEle);
        } else {
            $('.dis-message-container').append(messageEle);
        }
        thisMessageEle = $('.dis-message-container').children().last();
        thisMessageEle.find('.dis-message-close').on('click', function(e) {
            var targetMessageEle = e.target.parentElement.parentElement;
            targetMessageEle.parentElement.removeChild(targetMessageEle);
        });
        setTimeout(function() {
            thisMessageEle.remove();
        }, 5000);
    }

    function urlSearch2Obj(searchStr) {
        var obj = {};
        if (searchStr.indexOf('?') !== -1) {
            searchStr = searchStr.split('?')[1];
        }
        var str = searchStr.split('#')[0];
        var temp = str.split('&');
        for (var i = 0; i < temp.length; i++) {
            var temp2 = temp[i].split('=');
            obj[temp2[0]] = temp2[1];
        }
        return obj;
    }

}(window, document, $));