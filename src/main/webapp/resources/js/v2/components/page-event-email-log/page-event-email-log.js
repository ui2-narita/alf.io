(function() {

'use strict';


angular.module('adminApplication').component('pageEventEmailLog', {
    templateUrl: '/resources/js/v2/components/page-event-email-log/page-event-email-log.html',
    controller: ['EmailService', pageEventEmailLog],
    bindings: {
        eventShortName: '<',
        eventAndOrganization: '<'
    }
})


function pageEventEmailLog(EmailService) {
    var ctrl = this;

    ctrl.$onInit = function() {
        ctrl.emails = [];
        EmailService.loadEmailLog(ctrl.eventShortName).then(function(result) {
            ctrl.emails = result.data;
        });
    };
}

})();