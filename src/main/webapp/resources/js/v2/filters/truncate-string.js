(function () {

'use strict';

angular.module('adminApplication').filter('truncateString', function() {
    return function(string, maxLength) {
        if(!angular.isDefined(string)) {
            return "";
        }
        var l = angular.isDefined(maxLength) ? maxLength : 50;
        return string.length > l ? (string.substring(0, l-4) + '...') : string;
    }
});

})();