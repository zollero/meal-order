

;(function (window, document, $) {
    'use strict';

    var DISH_LINE_HEIGHT = 45;

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

    var urlSearch = window.location.search;
    //var urlParams =

    var addMealURL = '/ordering/';

    /**
     * TODO
     * 1. 添加一个弹出提示的消息样式
     * 2. server端编写针对不同的订餐任务的socket链接，以团队ID为标识
     * 3. client端传不同的参数在url上，与server连接
     */

        //var dishSocket = io(addMealURL);
    //
    //addDishBtn.on('click', function (e) {
    //    var infoEle = $(this).parent();
    //    var dishId = infoEle.attr('dish-id'),
    //        dishName = infoEle.attr('dish-name'),
    //        price = infoEle.attr('dish-price');
    //
    //    dishSocket.emit('select-dish', {
    //        dishId: dishId,
    //        dishName: dishName,
    //        price: price
    //    })
    //});
    //
    //dishSocket.on('addDish', function (data) {
    //    console.log(data);
    //});

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
            dishPrice = dataTarget.attr('dish-price');

        var thisDishLine = dishListEle.find('.dish-line[dish-id=' + dishId + ']');
        if (thisDishLine.length === 0) {
            var basketLine = '<div class="dish-line" dish-id="' + dishId + '" dish-name="' + dishName + '" dish-price="' + dishPrice + '">' +
                '<div class="dish-name">' + dishName + '</div>' +
                '<div class="ope-btns"><button type="button" class="minus-btn">-</button>' +
                '<input type="text" readonly class="selected-no" value="1" />' +
                '<button type="button" class="plus-btn">+</button></div>' +
                '<div class="total-price">¥' + dishPrice + '</div></div>';
            thisDishLine = dishListEle.append(basketLine).find('.dish-line[dish-id=' + dishId + ']');
            //给增加和减少按钮添加事件处理函数
            initMPEvent(thisDishLine);
            resizeDishListHeight();
        } else {
            var selectedNoEle = thisDishLine.find('.selected-no'),
                selectedNo = Math.floor(Number(selectedNoEle.val())) + 1;
            var thisTotalPriceEle = thisDishLine.find('.total-price');
            selectedNoEle.val(selectedNo);
            thisTotalPriceEle.text('¥' + selectedNo * Number(dishPrice));
        }
        refreshTotalDishesInfo();
        showMessage('info', '添加了一个菜');
        //TODO  修改左下角购物车上的数字
        //TODO emit一个事件给当前点餐的其他人
    });

    function initMPEvent(target) {
        var selectedNoEle = target.find('.selected-no'),
            totalPriceEle = target.find('.total-price'),
            dishPrice = Number(target.attr('dish-price'));
        target.find('.minus-btn').on('click', function() {
            var value = Number(selectedNoEle.val()) - 1;
            if (value > 0) {
                selectedNoEle.val(value);
                totalPriceEle.text('¥' + value * dishPrice);
            } else {
                target.remove();
                resizeDishListHeight();
            }
            refreshTotalDishesInfo();
            //TODO emit事件给其他人，减少了一个菜
        });
        target.find('.plus-btn').on('click', function() {
            var value = Number(selectedNoEle.val()) + 1;
            selectedNoEle.val(value);
            totalPriceEle.text('¥' + value * dishPrice);
            refreshTotalDishesInfo();
            //TODO emit事件给其他人，添加了一个菜
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

}(window, document, $));