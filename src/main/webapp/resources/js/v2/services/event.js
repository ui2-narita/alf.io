(function () {

'use strict';


angular.module('adminApplication').service('EventService', function($http, HttpErrorHandler) {
    return {
        getAllEvents: function() {
            return $http.get('/admin/api/events.json').error(HttpErrorHandler.handle);
        },
        getEvent: function(name) {
            return $http.get('/admin/api/events/'+name+'.json').error(HttpErrorHandler.handle);
        },
        getPendingPayments: function(eventName) {
            return $http.get('/admin/api/events/'+eventName+'/pending-payments').error(HttpErrorHandler.handle);
        },
        getAdditionalFields: function(eventName) {
            return $http.get('/admin/api/events/'+eventName+'/additional-field').error(HttpErrorHandler.handle);
        }
    };
});



})();