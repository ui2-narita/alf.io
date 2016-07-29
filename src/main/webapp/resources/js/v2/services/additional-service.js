(function () {

'use strict';


angular.module('adminApplication').service('AdditionalService', ['$http', 'HttpErrorHandler', '$q', function($http, HttpErrorHandler, $q) {
    return {
        loadAll: function(eventId) {
            if(angular.isDefined(eventId)) {
                return $http.get('/admin/api/event/'+eventId+'/additional-services/').error(HttpErrorHandler.handle);
            }
            var deferred = $q.defer();
            deferred.resolve({data:[]});
            return deferred.promise;
        },
        save: function(eventId, additionalService) {
            return (angular.isDefined(additionalService.id)) ? this.update(eventId, additionalService) : this.create(eventId, additionalService);
        },
        create: function(eventId, additionalService) {
            return $http.post('/admin/api/event/'+eventId+'/additional-services/', additionalService).error(HttpErrorHandler.handle);
        },
        update: function(eventId, additionalService) {
            return $http['put']('/admin/api/event/'+eventId+'/additional-services/'+additionalService.id, additionalService).error(HttpErrorHandler.handle);
        },
        remove: function(eventId, additionalService) {
            return $http['delete']('/admin/api/event/'+eventId+'/additional-services/'+additionalService.id).error(HttpErrorHandler.handle);
        },
        validate: function(additionalService) {
            return $http.post('/admin/api/additional-services/validate', additionalService).error(HttpErrorHandler.handle);
        }
    };
}]);



})();