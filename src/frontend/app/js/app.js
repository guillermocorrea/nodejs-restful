/**
 * restfulApp Module
 *
 * Description
 */
(function() {
    'use strict';
    /**
     * Configuration module, holds constants, values
     */
    angular.module('restfulApp.config', [])
        .constant('USER_ROLES', {
            guest: 'guest',
            user: 'user',
            admin: 'admin'
        })
        .constant('EVENTS', {
            loginRequired: 'event:auth-loginRequired',
            loggedIn: 'event:auth-loggedIn',
            loggedOut: 'event:auth-loggedOut'
        })
        .constant('TOKENS', {
            userData: 'userData',
            bearerToken: 'bearerToken',
            refreshToken: 'refreshToken'
        })
        .constant('BASE_API_PATH', '/api/v1/')

        .constant('API_CONFIG',
        {
            tokenEndpoint:'/oauth/token/',
            client_id: 'mobileV1',
            client_secret: 'abc123456'
        });

    /**
     * The app object
     * @type {ng.IModule}
     */
    var restfulApp = angular.module('restfulApp', ['ngRoute', 'ngAnimate', 'ngResource', 'restfulApp.config']);
    /**
     * The storage service, store´s  and retrieves data on client´s device
     */
    restfulApp.factory('storageService',
        /**
         * The storage service
         * @returns {{setItem: setItem, getItem: getItem}}
         */
        function () {
        return {
            /**
             * Sets an item to the storage
             * @param key
             * @param value
             */
            setItem: function(key, value) {
                localStorage.setItem(key, value);
            },
            /**
             * Gets an item from storage
             * @param key
             * @returns {*}
             */
            getItem: function(key) {
                return localStorage.getItem(key);
            },
            /**
             * Removes an item from storage
             * @param key
             */
            removeItem: function (key) {
                localStorage.removeItem(key);
            }
        };
    });
    /**
     * Session service, holds authenticated user data
     */
    restfulApp.factory('sessionService', ['storageService', 'TOKENS',
        /**
         * Session service, holds authenticated user data
         * @param storageService
         * @param TOKENS
         * @returns {{create: create, destroy: destroy, isAuthenticated: isAuthenticated}}
         */
        function(storageService, TOKENS) {
        return {
            /**
             * Create a new session
             * @param userData
             * @param token
             * @param refreshToken
             */
            create: function(userData, token, refreshToken) {
                storageService.setItem(TOKENS.userData, userData);
                storageService.setItem(TOKENS.bearerToken, token);
                storageService.setItem(TOKENS.refreshToken, refreshToken);
            },
            /**
             * Destroys the current session
             */
            destroy: function() {
                debugger;
                storageService.removeItem(TOKENS.userData);
                storageService.removeItem(TOKENS.bearerToken);
                storageService.removeItem(TOKENS.refreshToken);
            },
            /**
             * Gets the user data
             * @returns {*}
             */
            getUserData: function() {
                return storageService.getItem(TOKENS.userData);
            },
            /**
             * Sets the user data
             * @param userData
             */
            setUserData: function (userData) {
                storageService.setItem(TOKENS.userData, JSON.stringify(userData));
            },
            /**
             * Gets the bearer token
             * @returns {*}
             */
            getToken: function() {
                return storageService.getItem(TOKENS.bearerToken);
            },
            /**
             * Sets the bearer token
             * @param token
             */
            setToken: function (token) {
                storageService.setItem(TOKENS.bearerToken, token);
            },
            /**
             * Gets the refresh token
             * @returns {*}
             */
            getRefreshToken: function () {
                return storageService.getItem(TOKENS.refreshToken);
            },
            /**
             * Sets the refresh token
             * @param refreshToken
             */
            setRefreshToken: function (refreshToken) {
                storageService.setItem(TOKENS.refreshToken, refreshToken);
            },
            /**
             * Determines if the user is authenticated
             * @returns {boolean}
             */
            isAuthenticated: function() {
                // debugger;
                return this.getToken() !== null;
            }
        };
    }]);
    /**
     * Authentication service
     */
    restfulApp.factory('authService', ['$http', '$rootScope', 'sessionService', 'usersService', 'API_CONFIG', 'BASE_API_PATH', 'EVENTS',
        /**
         * The authentication service
         * @param $http
         * @param $rootScope
         * @param sessionService
         * @param usersService
         * @param API_CONFIG
         * @param BASE_API_PATH
         * @param EVENTS
         * @returns {{isAuthenticated: isAuthenticated, login: login, isAuthorized: isAuthorized}}
         */
            function($http, $rootScope, sessionService, usersService, API_CONFIG, BASE_API_PATH, EVENTS) {
            return {
                /**
                 * Verifies if the user is authenticated
                 * @returns {boolean}
                 */
                isAuthenticated: function() {
                    return sessionService.isAuthenticated();
                },
                /**
                 * Handles the login process, if login is successful saves the authorization token for further api calls
                 * @param credentials
                 * @returns {*}
                 */
                login: function(credentials) {
                    var payload = {"grant_type": "password", "client_id": API_CONFIG.client_id, "client_secret": API_CONFIG.client_secret, "username": credentials.username, "password": credentials.password};
                    return $http.post(API_CONFIG.tokenEndpoint, payload).then(function (res) {
                        // TODO: define a user model object and map it from response
                        sessionService.setToken(res.data.access_token);
                        sessionService.setRefreshToken(res.data.refresh_token);
                        $http.get(BASE_API_PATH + 'users/' + credentials.username).then(function (res) {
                            sessionService.setUserData(res.data);
                            $rootScope.$broadcast(EVENTS.loggedIn, res.data);
                            // TODO: refactor this
                            // $rootScope.userSession = res.data;
                        });
                    });
                },
                /**
                 * Verifies if the user is authorized
                 * @param authorizedRoles
                 * @returns {boolean}
                 */
                isAuthorized: function (authorizedRoles) {
                    if (!angular.isArray(authorizedRoles)) {
                        authorizedRoles = [authorizedRoles];
                    }
                    return (this.isAuthenticated() && authorizedRoles.indexOf(sessionService.getUserData().role) !== -1);
                },
                /**
                 * Get´s the user data
                 * @returns {*}
                 */
                userSession: sessionService.getUserData
            };
        }]);

    // Interceptors
    /**
     * Authentication http interceptor
     */
    restfulApp.factory('authInterceptor', ['$q', '$log', '$rootScope', 'sessionService', 'EVENTS',
        /**
         * The authentication interceptor
         * @param $q
         * @param $log
         * @param $rootScope
         * @param sessionService
         * @param EVENTS
         * @returns {{request: 'request', responseError: 'responseError'}}
         */
            function($q, $log, $rootScope, sessionService, EVENTS) {
            return {
                /**
                 * Request handler, validate if user is logged in then add authorization bearer token header
                 * @param config
                 * @returns {*}
                 */
                'request': function(config) {
                    if (sessionService.isAuthenticated()) {
                        config.headers['Authorization'] = 'Bearer ' + sessionService.getToken();
                    }

                    return config;
                },
                /**
                 * Handler for response errors.
                 * Emit an 'event:auth-loginRequired' event when response status is 401
                 * @param rejection
                 * @returns {*}
                 */
                'responseError': function(rejection) {
                    $log.log('responseError: ' + JSON.stringify(rejection));
                    if (rejection.status === 401 && !rejection.config.ignoreAuthModule) {
                        var deferred = $q.defer();
                        $rootScope.$broadcast(EVENTS.loginRequired, rejection);
                        return deferred.promise;
                    }

                    // otherwise, default behaviour
                    return $q.reject(rejection);
                }
            };
        }]);
    /**
     * Configure interceptors
     */
    restfulApp.config(['$httpProvider', function($httpProvider) {
        $httpProvider.interceptors.push('authInterceptor');
    }]);
    /**
     * Config the routes
     */
    restfulApp.config(['$routeProvider',
        /**
         * Route handler
         * @param $routeProvider
         */
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
                .when('/login', {
                    templateUrl: '/app/views/users/login.html',
                    controller: 'loginController'
                })
        }
    ]);
    /**
     * Kickstart the app, register global events
     */
    restfulApp.run(['$location', '$rootScope', 'EVENTS',
        /**
         * Main app method
         * @param $location
         * @param $rootScope
         * @param EVENTS
         */
            function($location, $rootScope, EVENTS) {
            $rootScope.$on(EVENTS.loginRequired,
                /**
                 * Authentication required event handler
                 */
                    function() {
                    $location.path('/login');
                });
            $rootScope.$on(EVENTS.loggedIn,
                /**
                 * Logged in event handler
                 * @param user
                 */
                    function (user) {
                    $rootScope.userSession = user;
                });
            $rootScope.$on(EVENTS.loggedOut,
                /**
                 * Logged out event handler
                 */
                    function () {
                    $rootScope.userSession = null;
                }
            )
        }]);
    /**
     * The users repository
     */
    restfulApp.factory('usersService', ['$resource', 'BASE_API_PATH',
        /**
         * The users repository service
         * @param $resource
         * @param BASE_API_PATH
         * @returns {{repo: *}}
         */
            function($resource, BASE_API_PATH) {
            return {
                /**
                 * The resource
                 */
                repo: $resource(BASE_API_PATH + 'users/:id', {id: '@username'}, {update: {method: 'PUT'}})
            };
        }]);
    /**
     * The notification service, wrapper for toastr notifications
     */
    restfulApp.factory('notificationService',
        /**
         * Notification service, wrapper for toastr notifications
         * @returns {{success: success, info: info, warning: warning, error: error}}
         */
            function() {
            return {
                /**
                 * Success notification
                 * @param text
                 * @param [title]
                 */
                success: function (text, title) {
                    title === undefined ? toastr.success(text) : toastr.success(text, title);
                },
                /**
                 * Info notification
                 * @param text
                 * @param [title]
                 */
                info: function (text, title) {
                    title === undefined ? toastr.info(text) : toastr.info(text, title);
                },
                /**
                 * Warning notification
                 * @param text
                 * @param [title]
                 */
                warning: function (text, title) {
                    title === undefined ? toastr.warning(text) : toastr.warning(text, title);
                },
                /**
                 * Error notification
                 * @param text
                 * @param [title]
                 */
                error: function (text, title) {
                    title === undefined ? toastr.error(text) : toastr.error(text, title);
                }
            };
        });
// Controllers
    /**
     * The main controller
     */
    restfulApp.controller('mainController', ['$scope', '$rootScope', '$location', 'authService', 'sessionService', 'notificationService',
        /**
         * The main controller
         * @param $scope
         * @param $rootScope
         * @param $location
         * @param authService
         * @param sessionService
         * @param notificationService
         */
            function($scope, $rootScope, $location, authService, sessionService, notificationService) {
            /**
             * The navigation list
             * @type {*[]}
             */
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
            /**
             * Handles the route change success event, loop through to the nav list
             * and set active property if is the route
             */
            function detectRoute() {
                angular.forEach($scope.navList, function(item) {
                    item.active = $location.path() === item.path;
                });
            }

            /**
             * Determines if the user is authenticated
             * @type {boolean|*|Boolean}
             */
            $scope.isAuthenticated = authService.isAuthenticated;
            /**
             * The session service
             */
            $scope.isAuthorized = authService.isAuthorized;
            /**
             * The user´s session data
             */
            $scope.getUserSession = function() {
                //debugger;
                return JSON.parse(sessionService.getUserData());
            };
            /**
             * User´s logout
             */
            $scope.logout = function() {
                sessionService.destroy();
                $rootScope.userSession = null;
                notificationService.info('Successfully logged out');
            };
            /**
             * Subscribes to the route change success event
             */
            $scope.$on('$routeChangeSuccess', detectRoute);
        }
    ]);
    /**
     * The about controller
     */
    restfulApp.controller('aboutController', ['$scope',
        function($scope) {
            $scope.message = 'I´m about page!';
        }
    ]);
    /**
     * The contact controller
     */
    restfulApp.controller('contactController', ['$scope',
        function($scope) {
            $scope.message = 'I´m contact page!';
        }
    ]);
    /**
     * The users controller
     */
    restfulApp.controller('usersController', ['$scope', '$log', 'notificationService', 'usersService',
        /**
         * The users controller
         * @param $scope
         * @param $log
         * @param notificationService
         * @param usersService
         */
            function($scope, $log, notificationService, usersService) {
            /**
             * Load users data
             */
            usersService.repo.query(function(data, headers) {
                $scope.users = data;
            });
            /**
             * The current user, used for editing o creating a user
             * @type {{}}
             */
            $scope.currentUser = {};
            /**
             * Initialize the current user for creation and set the modal title
             */
            $scope.newUser = function() {
                $scope.currentUser = {};
                $scope.modalTitle = 'New user';
            };
            /**
             * Persists a user, new or updated
             * @param user
             */
            $scope.save = function(user) {
                // todo validate add / edit
                $scope.users.push(user);
                notificationService.success('User saved!');
                $('#saveForm').modal('hide');
            };
            /**
             * Initialize the current user for editing, clone´s the current user
             * and set modal´s title
             * @param user
             */
            $scope.editForm = function (user) {
                $scope.modalTitle = 'Edit user';
                $scope.currentUser = angular.copy(user);
                $('#saveForm').modal('show');
            };
            /**
             * Show´s the confirmation delete form
             * @param user
             */
            $scope.deleteForm = function (user) {
                $scope.currentUser = angular.copy(user);
                $('#confirmDeleteModal').modal('show');
            };
            /**
             * Delete the user
             */
            $scope.confirmDelete = function () {
                $scope.users = _.without($scope.users, _.findWhere($scope.users, {username: $scope.currentUser.username}));
                notificationService.success('User deleted');
                $('#confirmDeleteModal').modal('hide');
            };
        }
    ]);
    /**
     * Handles login and registration
     */
    restfulApp.controller('loginController', ['$scope', '$log', 'notificationService', 'authService', 'usersService',
        /**
         * Handles login and registration
         * @param $scope
         * @param $log
         * @param notificationService
         * @param authService
         */
            function($scope, $log, notificationService, authService) {
            /**
             * Handles user login
             * @param user
             */
            $scope.login = function(user) {
                authService.login(user).then(function () {
                        notificationService.success('Logged in')
                    }, function () {
                        notificationService.error('Login failed');
                    }
                )
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
})();