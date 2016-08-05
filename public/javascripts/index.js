

angular.module('mealOrder', [])
.controller('MenuController', function ($scope) {
    
    $scope.menus = [{
        name: '麻婆豆腐',
        price: 12
    }, {
        name: '土豆烧鸡',
        price: 20
    }]
});