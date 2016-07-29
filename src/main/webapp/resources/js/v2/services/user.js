(function () {

'use strict';


angular.module('adminApplication').service('UserService', function($http, HttpErrorHandler) {
    return {
        getAllRoles: function() {
            return $http.get('/admin/api/roles.json').error(HttpErrorHandler.handle);
        },
        getAllUsers : function() {
            return $http.get('/admin/api/users.json').error(HttpErrorHandler.handle);
        },
        editUser : function(user) {
            var url = angular.isDefined(user.id) ? '/admin/api/users/edit' : '/admin/api/users/new';
            return $http['post'](url, user).error(HttpErrorHandler.handle);
        },
        checkUser : function(user) {
            return $http['post']('/admin/api/users/check', user).error(HttpErrorHandler.handle);
        },
        loadUser: function(userId) {
            return $http.get('/admin/api/users/'+userId+'.json').error(HttpErrorHandler.handle);
        },
        loadCurrentUser: function() {
            return $http.get('/admin/api/users/current.json').error(HttpErrorHandler.handle);
        },
        updatePassword: function(passwordContainer) {
            return $http.post('/admin/api/users/update-password.json', passwordContainer).error(HttpErrorHandler.handle);
        },
        deleteUser: function(user) {
            return $http['delete']('/admin/api/users/'+user.id).error(HttpErrorHandler.handle);
        },
        resetPassword: function(user) {
            return $http['put']('/admin/api/users/'+user.id+'/reset-password').error(HttpErrorHandler.handle);
        }
    };
});


})();