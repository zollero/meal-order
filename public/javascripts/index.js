

angular.module('mealOrder', [])
.controller('MenuController', function ($scope, $http) {

    $http({
        method: 'get',
        url: 'http://10.224.195.58:3000/menu/all'
    }).success(function (data, status) {
        console.log(data);
        $scope.menus = data.menus;
    }).error(function (data, status) {

    });

    //创建一个socket连接
    var socket = io('ws://10.224.195.58:3000/');

    socket.on('news', function (data) {
        console.log(data);
    });

    $scope.selectedMeals = [];

    //选菜
    $scope.addMeal = function (meal) {
        var index = $scope.selectedMeals.indexOf(meal);
        if (index === -1) {
            $scope.menus[$scope.menus.indexOf(meal)].selected = true;
            $scope.selectedMeals.push(meal);
            socket.emit('addMeal', meal);
        }
    };

    //取消选菜
    $scope.deleteMeal = function (meal) {
        var index = $scope.selectedMeals.indexOf(meal);
        if (index !== -1) {
            $scope.menus[$scope.menus.indexOf(meal)].selected = false;
            $scope.selectedMeals.splice(index, 1);
            socket.emit('deleteMeal', meal);
        }
    };
});