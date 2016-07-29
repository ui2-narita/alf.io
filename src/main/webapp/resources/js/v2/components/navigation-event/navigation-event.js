(function() {

'use strict';


angular.module('adminApplication').component('navigationEvent', {
    templateUrl: '/resources/js/v2/components/navigation-event/navigation-event.html',
    controller: ['$state', NavigationEvent],
    bindings: {
        eventShortName: '<',
        eventAndOrganization: '<'
    }
});


function NavigationEvent($state) {
    var ctrl = this;

    ctrl.$onInit = function() {
        ctrl.isInternal = ctrl.eventAndOrganization.event.type === 'INTERNAL';
    };

    ctrl.stateIs = stateIs;
    //
    function stateIs(state) {
        return $state.is(state);
    }
}




})();