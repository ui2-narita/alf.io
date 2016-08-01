(function () {

'use strict';

angular.module('adminApplication').filter('statusText' , function() {
    return function(status) {
        if(!status) {
            return '';
        }
        return status.replace(/_/g, ' ').toLowerCase();
    };
});

})();