(function() {

'use strict';


angular.module('adminApplication').component('pageEventTicketsCategories', {
    templateUrl: '/resources/js/v2/components/page-event-tickets-categories/page-event-tickets-categories.html',
    controller: ['EventService', 'PriceCalculator', PageEventTicketsCategories],
    bindings: {
        eventShortName: '<',
        eventAndOrganization: '<'
    }
})


function PageEventTicketsCategories(EventService, PriceCalculator) {

    var ctrl = this;

    ctrl.$onInit = function() {
        ctrl.event = ctrl.eventAndOrganization.event;
        ctrl.organization = ctrl.eventAndOrganization.organization;
    }

    ctrl.calculateTotalPrice = calculateTotalPrice;
    ctrl.evaluateCategoryStatusClass = evaluateCategoryStatusClass;

    //

    function calculateTotalPrice(event) {
        return PriceCalculator.calculateTotalPrice(event);
    }



    function evaluateCategoryStatusClass(index, category) {
        if(category.expired) {
            return 'category-expired';
        }
        return 'category-' + evaluateBarType(index);
    }


    function evaluateBarType(index) {
        var barClasses = ['danger', 'warning', 'info', 'success'];
        if(index < barClasses.length) {
            return barClasses[index];
        }
        return index % 2 == 0 ? 'info' : 'success';
    }

}

})();