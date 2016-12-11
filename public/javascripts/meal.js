

;(function (window, document, $) {
    'use strict';

    var DISH_LINE_HEIGHT = 45;

    var USER_NAME = $('#username').text();

    var dishListEle = $('#dish-list'),
        addDishBtn = $('.add-dish-btn'),
        basketInfo = $('#basket-info'),
        cartBasket = $('#cart-basket')[0],
        submitBtn = $('#submit-meal-btn'),
        confirmModal = $('#confirm-order-modal'),
        confirmDishesEle = $('#confirm-dishes');

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

    // var addMealURL = '/meal?teamId=' + urlParams.teamId + '&username=' + USER_NAME;
    var addMealURL = '/meal?orderId=' + urlParams.orderId + '&username=' + USER_NAME;

    /**
     * 1. 添加一个弹出提示的消息样式
     * 2. server端编写针对不同的订餐任务的socket链接，以团队ID为标识
     * 3. client端传不同的参数在url上，与server连接
     */
    var mealSocket = io(addMealURL);

    mealSocket.on('message', function(data) {
        showMessage(data.type, data.message);
    });

    //对后面进入的用户，自动将之前选好的菜品初始化
    mealSocket.on('selected-dishes', function (data) {
        if (data.length && data.length > 0) {
            var dishLinesHtml = '';
            $.each(data, function (i, v) {
                dishLinesHtml += generateDishLine(v);
            });
            dishListEle.append(dishLinesHtml);
            var dishLines = dishListEle.find('.dish-line').toArray();
            $.each(dishLines, function (i, v) {
                initMPEvent($(v));
            });
            resizeDishListHeight();
            refreshTotalDishesInfo();
        }
    });


    //监听其他人点菜的事件
    mealSocket.on('someone-add-dish', function(data) {
        showMessage('success', '<span class="text-danger">' + data.username + '</span> 点了一份 <span class="text-danger">' + data.dishName + '</span>');
        addDishHandler(data);
    });

    //监听其他人取消点菜的事件
    mealSocket.on('someone-del-dish', function(data) {
        showMessage('danger', '<span class="text-danger">' + data.username + '</span> 减掉了一份 <span class="text-danger">' + data.dishName + '</span>');
        delDishHandler(data);
    });

    mealSocket.on('confirm-order', function (data) {
        showMessage('warning', '<span class="text-danger">' + data.submitUser + '</span> 提交了订单，请确认。');
        confirmModal.modal('show');
        confirmModal.find('.submit-user').text(data.submitUser);
        var dishListHtml = '',
            orderTotal = 0;
        $.each(data.dishes, function (i, v) {
            dishListHtml += '<tr><td>' + v.dishName + '</td><td>¥' + v.price + '元/份</td><td>' + v.no + '</td>';
            if (typeof v.price === 'number' && typeof v.no === 'number') {
                orderTotal += v.price * v.no;
            }
        });
        confirmDishesEle.html(dishListHtml);
        $('#order-info').html('总价：¥' + orderTotal + '元。');
        confirmModal.find('button').removeAttr('disabled');
        //添加一个倒计时读秒，若超过五分钟未同意，则自动同意
        var TOTAL_TIME_SECOND = 300;
        var autoAcceptOrder = setInterval(function () {
            var MINUTE = Math.floor(TOTAL_TIME_SECOND / 60),
                SECOND = TOTAL_TIME_SECOND % 60;
            var timeCount = '0' + MINUTE + ':' + (SECOND > 9 ? SECOND : '0' + SECOND);
            $('#accept-time-count').text(timeCount);
            TOTAL_TIME_SECOND --;
            if (TOTAL_TIME_SECOND === 0) {
                clearInterval(autoAcceptOrder);
                $('#accept-order').click();
            }
        }, 1000);

        $('#retreat-order').on('click', function () {
            clearInterval(autoAcceptOrder);
            mealSocket.emit('retreat-order', {
                user: USER_NAME
            });
            confirmModal.find('button').attr('disabled', 'disabled');
        });
        $('#accept-order').on('click', function () {
            clearInterval(autoAcceptOrder);
            mealSocket.emit('accept-order', {
                user: USER_NAME
            });
            confirmModal.find('button').attr('disabled', 'disabled');
            confirmModal.find('h4').removeClass('text-danger').addClass('text-success').text('已同意，请等待其他成员响应。');
        });
    });

    mealSocket.on('submit-failed', function () {
        confirmModal.modal('hide');
    });
    mealSocket.on('submit-success', function () {
        confirmModal.find('.panel').removeClass('panel-danger').addClass('panel-success');
        confirmModal.find('.panel-title').html('订单已经生成');
        confirmModal.find('h4').removeClass('text-danger').addClass('text-success').text('订单已成功生成，点击"确定"返回首页。赶紧截图发给店家吧。');
        confirmModal.find('.modal-footer').html('<button type="button" class="btn btn-success">确定</button>');
        confirmModal.find('.modal-footer button').on('click', function () {
            window.location.href = '/home';
        });
    });

    confirmModal.on('hidden.bs.modal', function () {
        confirmModal.find('button').attr('disabled', 'disabled');
        $('#retreat-order').off('click');
        $('#accept-order').off('click');
        confirmDishesEle.html('');
    });

    function generateDishLine(dish) {
        if (typeof dish.no !== 'number') dish.no = 1;
        return '<div class="dish-line" dish-id="' + dish.dishId + '" dish-name="' + dish.dishName + '" dish-price="' + dish.price + '">' +
            '<div class="dish-name">' + dish.dishName + '</div>' +
            '<div class="ope-btns"><span class="minus-btn">-</span>' +
            '<input type="text" readonly class="selected-no" value="' + dish.no + '" />' +
            '<span class="plus-btn">+</span></div>' +
            '<div class="total-price">¥' + (dish.price * dish.no) + '</div></div>';
    }

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
        e.stopPropagation();
        mealSocket.emit('submit-order', {
            user: USER_NAME
        });
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
            thisDishLine = dishListEle.append(generateDishLine(dishInfo)).find('.dish-line[dish-id=' + dishInfo.dishId + ']');
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
        var dishId = target.attr('dish-id'),
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
        var dishListHeight = dishListEle.find('.dish-line').length * DISH_LINE_HEIGHT;
        dishListHeight = dishListHeight > 350 ? 350 : dishListHeight;
        dishListEle[0].style.height = dishListHeight + 'px';
        if (dishListHeight === 350) {
            dishListEle[0].style.overflowY = 'auto';
        }
    }

    dishListEle.scroll(function (e) {
        e.stopPropagation();
    });

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
            thisMessageEle.animate({
                opacity: 0
            }, 500, 'swing', function () {
                thisMessageEle.remove();
            });
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