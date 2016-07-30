(function () {

'use strict';


angular.module('adminApplication').service('EmailService', ['$http', 'HttpErrorHandler', function EmailService($http, HttpErrorHandler) {
    this.loadEmailLog = function(eventName) {
        return $http.get('/admin/api/events/'+eventName+'/email/').error(HttpErrorHandler.handle);
    };
   this.loadEmailDetail = function(eventName, messageId) {
       return $http.get('/admin/api/events/'+eventName+'/email/'+messageId).error(HttpErrorHandler.handle);
   }
}]);



})();