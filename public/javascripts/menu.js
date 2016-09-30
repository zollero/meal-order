

// angular.module('FoodMenu', [])
// .controller('AddMenuCtrl', ['$scope', function ($scope) {
//
//     var dishLineHTML = '<div class="form-group">' +
//         '<div class="col-lg-5 col-xs-5"><input class="form-control" name="dishName" type="text" placeholder="菜名" /></div>' +
//         '<div class="col-lg-5 col-xs-5"><input class="form-control" name="price" type="text" placeholder="单价：￥" /></div>' +
//         '<div class="col-lg-2 col-xs-2 text-center"><button type="button" class="btn btn-danger btn-sm"><span class="glyphicon glyphicon-minus-sign"></span></button></div>' +
//         '</div>';
//
//     var delThisDish = $scope.delThisDish = function(e) {
//         var ele;
//         if (e.target.nodeName === 'SPAN') {
//             ele = e.target.parentElement.parentElement.parentElement;
//         } else {
//             ele = e.target.parentElement.parentElement;
//         }
//         angular.element(ele).remove();
//     };
//
//     $scope.addDishLine = function () {
//         angular.element('#dish-list').append(dishLineHTML);
//         angular.element('#dish-list').find('.btn-danger:last').on('click', delThisDish);
//     };
//
//     $scope.submitMenu = function () {
//         var formArray = angular.element('#add-menu-form').serializeArray();
//         var formData = angular.element('#add-menu-form').serialize();
//         console.log(formArray);
//         console.log(formData);
//
//         console.log($scope.dishName)
//     }
// }]);


;(function (window, document, $) {
    var dishLineHTML = '<div class="form-group dish-line">' +
        '<div class="col-lg-5 col-xs-5"><input class="form-control" name="dishName" type="text" placeholder="菜名" /></div>' +
        '<div class="col-lg-5 col-xs-5"><input class="form-control" name="price" type="text" placeholder="单价" /></div>' +
        '<div class="col-lg-2 col-xs-2 text-left"><button type="button" class="btn btn-danger btn-sm"><span class="glyphicon glyphicon-minus-sign"></span></button></div>' +
        '</div>';

    var dishList = $('#dish-list'),
        addMenuForm = $('#add-menu-form'),
        messageModal = $('#message-modal');

    var priceRegExp = new RegExp(/^(\d|[1-9]\d+)(\.\d+)?$/);

    $('#add-dish-btn').on('click', addDishLine);
    addMenuForm.find('input').on('focus', inputFocusHandler);

    function addDishLine() {
        dishList.append(dishLineHTML);
        dishList.find('.btn-danger:last').on('click', delThisDish);
        dishList.find('.form-group:last').find('input').on('focus', inputFocusHandler);
    }

    function inputFocusHandler(e) {
        var inputGroup = $(e.target).parent();
        inputGroup.find('label').remove();
        inputGroup.removeClass('has-error');
    }

    function delThisDish(e) {
        var ele;
        if (e.target.nodeName === 'SPAN') {
            ele = e.target.parentElement.parentElement.parentElement;
        } else {
            ele = e.target.parentElement.parentElement;
        }
        $(ele).remove();
    }


    $('#submit-btn').on('click', function (e) {
        var dishInfo = validateForm(addMenuForm);
        //通过校验，将数据发送给后端
        if (dishInfo) {
            console.log(dishInfo);
            var btn = $(this).parent().find('button').button('loading');
            $.post('/menu/add', dishInfo, function (data) {
                console.log(data);
                if (data.success) {
                    messageModal.find('.panel-title').html(data.message);
                    messageModal.modal('show');
                }
                btn.button('reset');
            });
        } else {
            console.log('invalid');
        }
    });

    $('#add-more-btn').on('click', function () {
        var dishLines = dishList.find('.form-group');
        $.each(dishLines, function (index, value) {
           if (index !== 0) {
               $(value).remove();
           }
        });
        $('#reset-btn').click();
    });


    function validateForm(form) {
        var formGroups = form.find('.form-group.dish-line');
        var dishInfo = {
            menuName: undefined,
            dishes: []
        };
        var dishes = [];
        $.each(formGroups, function (index, value) {
            var inputs = $(value).find('input');
            var dishObj = {};
            $.each(inputs, function (i, v) {
                v = $(v);
                var inputValue = v.val();
                var inputName = v.attr('name');
                var placeholder = v.attr('placeholder');
                var pattern = new RegExp(v.attr('data-pattern'));
                if (inputValue === '' || (inputName === 'price' && !priceRegExp.test(inputValue))) {
                    var tip = inputValue === '' ? '不能为空' : '只能是数字';
                    v.parent().append('<label class="text-danger" style="position: absolute;top: 0;right: 30px;height: 34px;line-height: 34px;">' + tip + '</label>');
                    v.parent().addClass('has-error');
                    v.parent().removeClass('has-success');
                } else {
                    v.parent().find('label').remove();
                    v.parent().removeClass('has-error');
                    v.parent().addClass('has-success');
                    if (inputName === 'dishName' || inputName === 'price') {
                        dishObj[inputName] = inputValue;
                    } else {
                        dishInfo.menuName = inputValue;
                    }
                }
                v.parent().find('label').on('click', function (e) {
                    $(this).parent().find('input').focus();
                });
            });
            dishInfo.dishes.push(dishObj);
        });
        if (form.find('.has-error').length === 0) {
            return dishInfo;
        }
        return false;
    }





}(window, document, $));