(function () {

'use strict';

angular.module('adminApplication').service("HttpErrorHandler", function($rootScope, $log) {
    return {
        handle : function(error) {
            $log.warn(error);
            $rootScope.$broadcast('applicationError', error.message);
        }
    };
});


})();