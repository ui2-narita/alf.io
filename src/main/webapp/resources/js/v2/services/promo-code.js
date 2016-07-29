(function () {

'use strict';


angular.module('adminApplication').service('PromoCodeService', function($http, HttpErrorHandler) {
    return {
        add : function(eventId, promoCode) {
            return $http['post']('/admin/api/events/' + eventId + '/promo-code', promoCode).error(HttpErrorHandler.handle);
        },
        remove: function(eventId, promoCode) {
            return $http['delete']('/admin/api/events/' + eventId + '/promo-code/' + encodeURIComponent(promoCode)).error(HttpErrorHandler.handle);
        },
        list: function(eventId) {
            return $http.get('/admin/api/events/' + eventId + '/promo-code').error(HttpErrorHandler.handle);
        },
        countUse : function(eventId, promoCode) {
            return $http.get('/admin/api/events/' + eventId + '/promo-code/' + encodeURIComponent(promoCode)+ '/count-use');
        },
        disable: function(eventId, promoCode) {
            return $http['post']('/admin/api/events/' + eventId + '/promo-code/' + encodeURIComponent(promoCode)+ '/disable');
        },
        update: function(eventId, promoCode, toUpdate) {
            return $http.post('/admin/api/events/' + eventId + '/promo-code/'+ encodeURIComponent(promoCode), toUpdate);
        }
    };
});





})();