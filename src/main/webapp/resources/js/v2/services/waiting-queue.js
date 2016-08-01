(function () {

'use strict';


angular.module('adminApplication').service('WaitingQueueService', function($http, HttpErrorHandler) {
    return {
        countSubscribers: function(event) {
            return $http.get('/admin/api/event/'+event.shortName+'/waiting-queue/count').error(HttpErrorHandler.handle);
        },
        loadAllSubscribers: function(eventName) {
            return $http.get('/admin/api/event/'+eventName+'/waiting-queue/load').error(HttpErrorHandler.handle);
        }
    };
});


})();