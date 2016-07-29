(function() {

'use strict';


angular.module('adminApplication').component('pageEvent', {
    templateUrl: '/resources/js/v2/components/page-event/page-event.html',
    controller: ['EventService', PageEvent],
    bindings: {
        eventShortName: '<',
        eventAndOrganization: '<'
    }
})


function PageEvent(EventService) {

    var ctrl = this;

    ctrl.$onInit = function() {
        ctrl.event = ctrl.eventAndOrganization.event;
        ctrl.organization = ctrl.eventAndOrganization.organization;
    }

    ctrl.loadAll = loadAll;
    ctrl.isInternal = isInternal;


    function loadAll() {
        EventService.getEvent(ctrl.eventShortName).then(function(res) {
            ctrl.event = res.data.event;
            ctrl.organization = res.data.organization;
        });
    }

    function isInternal(event) {
        return event.type === 'INTERNAL';
    }
}

})();