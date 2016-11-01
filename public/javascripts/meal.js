

;(function (window, document, $) {
    'use strict';

    var DISH_LINE_HEIGHT = 45;

    var dishListEle = $('#dish-list'),
        addDishBtn = $('.add-dish-btn'),
        basketInfo = $('#basket-info'),
        cartBasket = $('#cart-basket')[0];

    var addMealURL = 'ws://' + document.location.host;

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
        } else {
            cartBasket.style.top = '0px';
        }
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
            //TODO emit事件给其他人，减少了一个菜
        });
        target.find('.plus-btn').on('click', function() {
            var value = Number(selectedNoEle.val()) + 1;
            selectedNoEle.val(value);
            totalPriceEle.text('¥' + value * dishPrice);
            //TODO emit事件给其他人，添加了一个菜
        });
    }

    function resizeDishListHeight() {
        dishListEle[0].style.height = dishListEle.find('.dish-line').length * DISH_LINE_HEIGHT + 'px';
    }

}(window, document, $));