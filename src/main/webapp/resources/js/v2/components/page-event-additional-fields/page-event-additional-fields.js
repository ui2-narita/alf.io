(function() {

'use strict';


angular.module('adminApplication').component('pageEventAdditionalFields', {
    templateUrl: '/resources/js/v2/components/page-event-additional-fields/page-event-additional-fields.html',
    controller: ['EventService', PageEventAdditionalFields],
    bindings: {
        eventShortName: '<',
        eventAndOrganization: '<'
    }
})


function PageEventAdditionalFields(EventService) {
    var ctrl = this;


    ctrl.$onInit = function() {
        EventService.getAdditionalFields(ctrl.eventShortName).success(function(result) {
            ctrl.additionalFields = result;
        });
    }
}

})();