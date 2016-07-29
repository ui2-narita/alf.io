(function() {

'use strict';


angular.module('adminApplication').component('ticketStatus', {
    template: '<canvas class="chart chart-pie" data-data="$ctrl.statistics" data-labels="$ctrl.labels" data-options="{animation:false}"></canvas>',
    controller: [TicketStatus],
    bindings: {
        statisticsContainer: '<'
    }
})


function TicketStatus() {

    var ctrl = this;

    ctrl.$onInit = function() {
        ctrl.labels = ['Sold', 'Checked in', 'Still available', 'Not yet allocated', 'Dynamically allocated'];
    }

    ctrl.$onChanges = function(changes) {
        if(changes.statisticsContainer.currentValue) {
            var newVal = changes.statisticsContainer.currentValue;
            ctrl.statistics = [newVal.soldTickets, newVal.checkedInTickets, newVal.notSoldTickets, newVal.notAllocatedTickets, newVal.dynamicAllocation];
        }
    };
}

})();