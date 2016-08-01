(function() {

'use strict';


angular.module('adminApplication').component('pageEventCheckIn', {
    templateUrl: '/resources/js/v2/components/page-event-check-in/page-event-check-in.html',
    controller: ['CheckInService', pageEventCheckIn],
    bindings: {
        eventShortName: '<',
        eventAndOrganization: '<'
    }
})


function pageEventCheckIn(CheckInService) {
    var ctrl = this;

    ctrl.$onInit = function() {
        loadTickets();
    };

    ctrl.toBeCheckedIn = toBeCheckedIn;



    function toBeCheckedIn(ticket, idx) {
        return  ['TO_BE_PAID', 'ACQUIRED'].indexOf(ticket.status) >= 0;
    }

    function loadTickets() {
        CheckInService.findAllTickets(ctrl.eventAndOrganization.event.id).success(function(tickets) {
            ctrl.tickets = tickets;
        });
    }
}

})();