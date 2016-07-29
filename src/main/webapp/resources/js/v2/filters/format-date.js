(function () {

'use strict';

angular.module('adminApplication').filter('formatDate' , function() {
    return function(dateAsString, pattern) {
        if(!angular.isDefined(dateAsString) || dateAsString === null) {
            return dateAsString;
        }
        var formatPattern = angular.isDefined(pattern) ? pattern : 'DD.MM.YYYY HH:mm';
        var date = moment(dateAsString.replace(/\[[A-Za-z0-9\-\/]+]/, ''));
        if(date.isValid()) {
            return date.format(formatPattern);
        }
        return dateAsString;
    };
});

})();