(function() {

'use strict';


angular.module('adminApplication').component('pageEventPluginLog', {
    templateUrl: '/resources/js/v2/components/page-event-plugin-log/page-event-plugin-log.html',
    controller: ['PluginService', pageEventPluginLog],
    bindings: {
        eventShortName: '<',
        eventAndOrganization: '<'
    }
})


function pageEventPluginLog(PluginService) {
    var ctrl = this;

    ctrl.$onInit = function() {
        ctrl.logEntries = [];
        PluginService.loadLogEntries(ctrl.eventShortName).success(function(result) {
            ctrl.logEntries = result;
        });
    };
}

})();