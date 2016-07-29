(function() {

'use strict';


angular.module('adminApplication').component('pageEventDonationHandling', {
    templateUrl: '/resources/js/v2/components/page-event-donation-handling/page-event-donation-handling.html',
    controller: ['EventService', 'AdditionalService',  PageEventDonationHandling],
    bindings: {
        eventShortName: '<',
        eventAndOrganization: '<'
    }
})


function PageEventDonationHandling(EventService, AdditionalService) {
    var ctrl = this;

    ctrl.$onInit = function() {
        AdditionalService.loadAll(ctrl.eventAndOrganization.event.id).then(function(res) {
            ctrl.additionalServices = res.data;
        });
    }
}

})();