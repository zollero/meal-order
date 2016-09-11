/**
 * 用户注册模块
 */

angular.module('FoodRegister', [])
.controller('RegisterController', function ($scope, $http) {

    $scope.account = {};

    $scope.submitForm = function () {
        console.log($scope.account);
        $http.post('./register', $scope.account)
            .success(function (data) {
                console.log(data);
                if (data.success) {
                    $scope.alertMessage = data.message;
                    $('#alert-modal').modal('show');
                    // document.querySelector('#show-modal-btn').click();
                    // $scope.showAlert = true;
                }
            });
    }
}).directive('checkPwd', function () {
    //检查密码是否一致
    return {
        require: 'ngModel',
        link: function (scope, ele, attrs, ctrl) {
            var firstPwd = document.querySelector('#' + attrs.checkPwd);
            ele.on('keyup', function () {
                scope.$apply(function () {
                    var value = ele.val() === firstPwd.value;
                    ctrl.$setValidity('pwd-check', value);
                });
            })
        }
    }
}).directive('checkUsername', function ($http) {
    //检验用户名是否已经被注册
    return {
        require: 'ngModel',
        link: function (scope, ele, attrs, ctrl) {
            ele.on('keyup', function () {
                var value = ele.val();
                if (!value || value.length < 5 || value.length > 12) {
                    scope.$apply(function () {
                        ctrl.$setValidity('unique-username', true);
                    });
                    return;
                }
                $http.get('./checkUniqueUsername', {
                    params: { username: ele.val() },
                    cache: false
                }).success(function (data) {
                    ctrl.$setValidity('unique-username', data.usable);
                }).error(function (err) {
                    console.log('err', err)
                });
            })
        }
    }
});