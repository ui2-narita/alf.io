(function() {

'use strict';


angular.module('adminApplication').component('pageEventPromoCodes', {
    templateUrl: '/resources/js/v2/components/page-event-promo-codes/page-event-promo-codes.html',
    controller: ['EventService', 'PromoCodeService', PageEventPromoCodes],
    bindings: {
        eventShortName: '<',
        eventAndOrganization: '<'
    }
})


function PageEventPromoCodes(EventService, PromoCodeService) {
    var ctrl = this;

    ctrl.$onInit = function() {
        loadPromoCodes();
    };



    function loadPromoCodes() {
        PromoCodeService.list(ctrl.eventAndOrganization.event.id).success(function(list) {
            ctrl.promocodes = list;
            angular.forEach(ctrl.promocodes, function(v) {
                (function(v) {
                    PromoCodeService.countUse(ctrl.eventAndOrganization.event.id, v.promoCode).then(function(val) {
                        v.useCount = parseInt(val.data, 10);
                    });
                })(v);
            });
        });
    }
}

})();