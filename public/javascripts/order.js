
;(function (window, document, $) {
    'use strict';

    var detailModal = $('#order-detail-modal'),
        confirmDishesEle = $('#confirm-dishes'),
        orderInfoEle = $('#order-info'),
        memberListEle = $('#member-list');

    $('.detail-btn').on('click', function (e) {
        var orderId = $(this).attr('orderId');
        detailModal.modal('show');

        $.get('/order/getOrderDetail', {
            orderId: orderId
        }, function (data) {
            console.log(data);
            if (data.success) {
                var dishListHtml = '',
                    memberListHtml = '';
                var result = data.result;
                if (result) {
                    $.each(result.dishes, function (i, v) {
                        dishListHtml += '<tr><td>' + v.dishName + '</td><td>¥' + v.price + '元/份</td><td>' + v.no + '</td>';
                    });
                    confirmDishesEle.html(dishListHtml);
                    orderInfoEle.html('总价：¥' + result.total + '元。');
                    $.each(result.members, function (i, v) {
                        if (i === result.members.length - 1) {
                            memberListHtml += v + '。';
                        } else {
                            memberListHtml += v + '、';
                        }
                    });
                    memberListEle.html(memberListHtml);
                }
            }
        });
    });

    detailModal.on('hidden.bs.modal', function () {
        confirmDishesEle.html('');
        orderInfoEle.html('');
        memberListEle.html('');
    });


}(window, document, $));