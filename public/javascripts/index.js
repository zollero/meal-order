

angular.module('mealOrder', [])
.controller('MenuController', function ($scope) {
    
    $scope.menus = [{
        name: '麻婆豆腐',
        price: 12
    }, {
        name: '土豆烧鸡',
        price: 20
    }];

    $scope.selectedMeals = [];

    $scope.addMeal = function (meal) {
        var index = $scope.selectedMeals.indexOf(meal);
        if (index === -1) {
            $scope.selectedMeals.push(meal);
        }
    };

    $scope.deleteMeal = function (meal) {
        var index = $scope.selectedMeals.indexOf(meal);
        if (index !== -1) {
            $scope.selectedMeals.splice(index, 1);
        }
    };
});