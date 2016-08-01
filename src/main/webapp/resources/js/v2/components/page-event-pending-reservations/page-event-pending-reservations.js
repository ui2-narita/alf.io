(function() {

'use strict';


angular.module('adminApplication').component('pageEventPendingReservations', {
    templateUrl: '/resources/js/v2/components/page-event-pending-reservations/page-event-pending-reservations.html',
    controller: ['EventService', pageEventPendingReservations],
    bindings: {
        eventShortName: '<',
        eventAndOrganization: '<'
    }
})


function pageEventPendingReservations(EventService) {
    var ctrl = this;

    ctrl.$onInit = function() {
        ctrl.pendingReservations = [];
        EventService.getPendingPayments(ctrl.eventShortName).success(function(data) {
            ctrl.pendingReservations = data;
        });
    };
}

})();