

;(function (window, document, $) {
    'use strict';

    var addMealURL = 'ws://' + document.location.host;

    var dishSocket = io(addMealURL);

    $('.add-dish-btn').on('click', function (e) {
        var infoEle = $(this).parent();
        var dishId = infoEle.attr('dish-id'),
            dishName = infoEle.attr('dish-name'),
            price = infoEle.attr('dish-price');

        dishSocket.emit('select-dish', {
            dishId: dishId,
            dishName: dishName,
            price: price
        })
    });

    dishSocket.on('addDish', function (data) {
        console.log(data);
    });



}(window, document, $));