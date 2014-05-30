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
// Services
restfulApp.factory('notificationService', function() {
    return {
        success: function (text) {
            toastr.success(text, "Success");
        },
        info: function (text) {
            toastr.info(text, "Info");
        },
        warning: function (text) {
            toastr.warning(text, "Warning");
        },
        error: function (text) {
            toastr.error(text, "Error");
        }
    };
});
// Controllers
restfulApp.controller('mainController', ['$scope', '$location',
    function($scope, $location) {
        $scope.message = 'Everyone come and see how good I look!';
        $scope.navList = [
            {
                title: "Home",
                path: "/",
                icon: "fa fa-home",
                active: true
            },
            {
                title: "Users",
                path: "/users",
                icon: "fa fa-users"
            }
        ];

        function detectRoute() {
            angular.forEach($scope.navList, function(item) {
                var regex = item.path;
                item.active = $location.path() === regex ? true : false;
            });
        }

        $scope.$on('$routeChangeSuccess', detectRoute);
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
restfulApp.controller('usersController', ['$scope', '$log', 'notificationService',
    function($scope, $log, notificationService) {
        $scope.users = [{
            "username": "andrey",
            "firstName": "Andrey",
            "lastName": "Kokovsko",
            "hashedPassword": "955b633f0a688cbeec563bcddb57cde5c3fde213",
            "salt": "B7onyj99ald/yd5JXtTiYNThrkan+s44ryc3glpP9QQ=",
            "__v": 0
        }, {
            "username": "johnathan",
            "firstName": "John",
            "lastName": "Malkovich",
            "hashedPassword": "5ce4a63be0cb761ff51c93c2304c637cc6eeddcc",
            "salt": "pU73PHhE8b2Dns1H3zXGjq5Odw+8QWvno6XJvjWUTy4=",
            "__v": 0
        }, {
            "username": "finn",
            "firstName": "Captain",
            "lastName": "Finn",
            "hashedPassword": "1cc3f37677229302608df844077f99889c10811e",
            "salt": "F5j4Cewl5hRx74DVIPTDn/bQI7UMHwEl/eAYfqaygRA=",
            "__v": 0
        }];
        $scope.currentUser = {};
        $scope.newUser = function() {
            $scope.currentUser = {};
            $scope.modalTitle = 'New user';
        };
        $scope.save = function(user) {
            // todo validate add / edit
            $scope.users.push(user);
            notificationService.success('User saved!');
            $('#saveForm').modal('hide');
        };
        $scope.editForm = function (user) {
            $scope.modalTitle = 'Edit user';
            $scope.currentUser = angular.copy(user);
            $('#saveForm').modal('show');
        };
        $scope.deleteForm = function (user) {
            $scope.currentUser = angular.copy(user);
            $('#confirmDeleteModal').modal('show');
        };
        $scope.confirmDelete = function () {
            $scope.users = _.without($scope.users, _.findWhere($scope.users, {username: $scope.currentUser.username}));
            notificationService.success('User deleted');
            $('#confirmDeleteModal').modal('hide');
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