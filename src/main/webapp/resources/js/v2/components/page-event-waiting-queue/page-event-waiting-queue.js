(function() {

'use strict';


angular.module('adminApplication').component('pageEventWaitingQueue', {
    templateUrl: '/resources/js/v2/components/page-event-waiting-queue/page-event-waiting-queue.html',
    controller: ['WaitingQueueService', pageEventWaitingQueue],
    bindings: {
        eventShortName: '<',
        eventAndOrganization: '<'
    }
})


function pageEventWaitingQueue(WaitingQueueService) {
    var ctrl = this;

    ctrl.$onInit = function() {
        WaitingQueueService.loadAllSubscribers(ctrl.eventShortName).success(function(result) {
            ctrl.subscriptions = result;
        });
    };
}

})();