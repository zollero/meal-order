

angular.module('FoodMenu', [])
.controller('AddMenuCtrl', ['$scope', function ($scope) {

    var dishLineHTML = '<div class="form-group">' +
        '<div class="col-lg-5 col-xs-5"><input class="form-control" name="dishName" type="text" placeholder="菜名" /></div>' +
        '<div class="col-lg-5 col-xs-5"><input class="form-control" name="price" type="text" placeholder="单价" /></div>' +
        '<div class="col-lg-2 col-xs-2 text-center"><button type="button" class="btn btn-danger btn-sm"><span class="glyphicon glyphicon-minus-sign"></span></button></div>' +
        '</div>';

    var delThisDish = $scope.delThisDish = function(e) {
        var ele;
        if (e.target.nodeName === 'SPAN') {
            ele = e.target.parentElement.parentElement.parentElement;
        } else {
            ele = e.target.parentElement.parentElement;
        }
        angular.element(ele).remove();
    };

    $scope.addDishLine = function () {
        angular.element('#dish-list').append(dishLineHTML);
        angular.element('#dish-list').find('.btn-danger:last').on('click', delThisDish);
    };

}]);