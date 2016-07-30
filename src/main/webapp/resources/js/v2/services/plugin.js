(function () {

'use strict';


angular.module('adminApplication').service('PluginService', ['$http', 'HttpErrorHandler', function PluginService($http, HttpErrorHandler) {
    this.loadLogEntries = function(eventName) {
        return $http.get('/admin/api/events/'+eventName+'/plugin/log').error(HttpErrorHandler.handle);
    };
}]);

})();





