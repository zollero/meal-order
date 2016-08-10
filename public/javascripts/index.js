

angular.module('mealOrder', [])
.controller('MenuController', function ($scope, $http) {

    $http({
        method: 'get',
        url: 'http://10.224.195.144:3000/menu/all'
    }).success(function (data, status) {
        console.log(data);
        $scope.menus = data.menus;
    }).error(function (data, status) {
        console.log('error');
    });

    $scope.selectedMeals = [];

    //创建一个socket连接
    var socket = io('ws://10.224.195.144:3000/');

    socket.on('news', function (data) {
        console.log(data);
    });

    //监听其他人选菜的事件
    socket.on('someOneAddMeal', function (meal) {
        console.log(meal);
        var index = checkMealIndex(meal);
        if (index.selectedMenuIndex === -1) {
            $scope.menus[index.menuIndex].selected = true;
            $scope.selectedMeals.push({
                name: $scope.menus[index.menuIndex].name,
                price: $scope.menus[index.menuIndex].price
            });
        }
    });
    //监听其他人删除选菜的事件
    socket.on('someOneDeleteMeal', function (meal) {
        console.log(meal);
        var index = checkMealIndex(meal);
        if (index.selectedMenuIndex !== -1) {
            $scope.menus[index.menuIndex].selected = false;
            $scope.selectedMeals.splice(index.selectedMenuIndex, 1);
        }
    });

    //选菜
    $scope.addMeal = function (meal) {
        var index = checkMealIndex(meal);
        if (index.selectedMenuIndex === -1) {
            $scope.menus[index.menuIndex].selected = true;
            $scope.selectedMeals.push({
                name: $scope.menus[index.menuIndex].name,
                price: $scope.menus[index.menuIndex].price
            });
            socket.emit('addMeal', meal);
        }
    };

    //取消选菜
    $scope.deleteMeal = function (meal) {
        var index = checkMealIndex(meal);
        if (index.selectedMenuIndex !== -1) {
            $scope.menus[index.menuIndex].selected = false;
            $scope.selectedMeals.splice(index.selectedMenuIndex, 1);
            socket.emit('deleteMeal', meal);
        }
    };

    function checkMealIndex(meal) {
        var indexObj = {};
        angular.forEach($scope.menus, function (value, index) {
            if (value.name === meal.name) {
                indexObj.menuIndex = index;
            }
        });
        angular.forEach($scope.selectedMeals, function (value, index) {
            if (value.name === meal.name) {
                indexObj.selectedMenuIndex = index;
            }
        });
        if (!indexObj.selectedMenuIndex) indexObj.selectedMenuIndex = -1;
        return indexObj;
    }
});