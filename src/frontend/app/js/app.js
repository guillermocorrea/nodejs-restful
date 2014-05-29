/**
 * restfulApp Module
 *
 * Description
 */
var restfulApp = angular.module('restfulApp', ['ngRoute', 'ngAnimate']);
// configure our routes
restfulApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider
        // route for the home page
        .when('/', {
            templateUrl: '/app/views/home.html',
            controller: 'mainController'
        })
        // route for the about page
        .when('/about', {
            templateUrl: '/app/views/about.html',
            controller: 'aboutController'
        })
        // route for the contact page
        .when('/contact', {
            templateUrl: '/app/views/contact.html',
            controller: 'contactController'
        }).when('/users', {
            templateUrl: '/app/views/users/list.html',
            controller: 'usersController'
        })
    }
]);
// Controllers
restfulApp.controller('mainController', ['$scope',
    function($scope) {
        $scope.message = 'Everyone come and see how good I look!';
    }
]);
restfulApp.controller('aboutController', ['$scope',
    function($scope) {
        $scope.message = 'I´m about page!';
    }
]);
restfulApp.controller('contactController', ['$scope',
    function($scope) {
        $scope.message = 'I´m contact page!';
    }
]);
restfulApp.controller('usersController', ['$scope', '$log',
    function($scope, $log) {
        $scope.users = [{
            "username": "andrey",
            "hashedPassword": "955b633f0a688cbeec563bcddb57cde5c3fde213",
            "salt": "B7onyj99ald/yd5JXtTiYNThrkan+s44ryc3glpP9QQ=",
            "__v": 0
        }, {
            "username": "johnathan",
            "hashedPassword": "5ce4a63be0cb761ff51c93c2304c637cc6eeddcc",
            "salt": "pU73PHhE8b2Dns1H3zXGjq5Odw+8QWvno6XJvjWUTy4=",
            "__v": 0
        }, {
            "username": "finn",
            "hashedPassword": "1cc3f37677229302608df844077f99889c10811e",
            "salt": "F5j4Cewl5hRx74DVIPTDn/bQI7UMHwEl/eAYfqaygRA=",
            "__v": 0
        }, {
            "username": "jayda",
            "hashedPassword": "7a0478481f99280bee0206c6e488b7c3be9c032c",
            "salt": "D0dBFPLmTYxwcDLVz09Czn65OdCAQPLfg+GgQj6YSSY=",
            "__v": 0
        }, {
            "username": "joyce",
            "hashedPassword": "59ea10c850026556db1142ccb3345fd56f681173",
            "salt": "AUqH0/orx9LIVCc88fVND8WZ+aA1oqlwjI6WXII53jg=",
            "__v": 0
        }];
        $scope.currentUser = {};
        $scope.newUser = function() {
            $scope.currentUser = {};
            $scope.modalTitle = 'New user';
        };
        $scope.save = function(user) {
        	// todo validate

        	$log.log('saving... ' + user);
        };
    }
]);
// Directives
restfulApp.directive('showErrors', ['$timeout',
    function($timeout) {
        return {
            restrict: 'A',
            require: '^form',
            link: function(scope, el, attrs, formCtrl) {
                // find the text box element, which has the 'name' attribute
                var inputEl = el[0].querySelector("[name]");
                // convert the native text box element to an angular element
                var inputNgEl = angular.element(inputEl);
                // get the name on the text box
                var inputName = inputNgEl.attr('name');
                // only apply the has-error class after the user leaves the text box
                inputNgEl.bind('blur', function() {
                    el.toggleClass('has-error', formCtrl[inputName].$invalid);
                });
                scope.$watch(function() {
                    return scope.showErrorsCheckValidity;
                }, function(newVal, oldVal) {
                    if (!newVal) {
                        return;
                    }
                    el.toggleClass('has-error', formCtrl[inputName].$invalid);
                });
                scope.$watch(function() {
                    return scope.showErrorsReset;
                }, function(newVal, oldVal) {
                    if (!newVal) {
                        return;
                    }
                    $timeout(function() {
                        el.removeClass('has-error');
                    }, 0, false);
                });
            }
        }
    }
]);