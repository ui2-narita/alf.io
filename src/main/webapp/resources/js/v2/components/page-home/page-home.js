(function() {

'use strict';


angular.module('adminApplication').component('pageHome', {
    templateUrl: '/resources/js/v2/components/page-home/page-home.html',
    controller: ['EventService', 'OrganizationService', 'UserService', PageHome]
})


function PageHome(EventService, OrganizationService, UserService) {

    var ctrl = this;

    ctrl.$onInit = function() {

        EventService.getAllEvents().then(function(res) {
            ctrl.events = res.data;
        });

        OrganizationService.getAllOrganizations().then(function(res) {
            ctrl.organizations = res.data;
        });

        UserService.getAllUsers().then(function(res) {
            ctrl.users = res.data;
        });
    }
}

})();