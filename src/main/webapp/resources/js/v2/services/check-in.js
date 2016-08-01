(function () {

'use strict';


angular.module('adminApplication').service('CheckInService', ['$http', function CheckInService($http) {
    return {
        findAllTickets : function(eventId) {
            return $http.get('/admin/api/check-in/' + eventId + '/ticket');
        },
        getTicket: function(eventId, code) {
            var ticketIdentifier = code.split('/')[0];
            return $http.get('/admin/api/check-in/' + eventId + '/ticket/' + ticketIdentifier + "?qrCode=" + encodeURIComponent(code));
        },
        checkIn: function(eventId, ticket) {
            var ticketIdentifier = ticket.code.split('/')[0];
            return $http['post']('/admin/api/check-in/' + eventId + '/ticket/' + ticketIdentifier, ticket);
        },
        manualCheckIn: function(ticket) {
            return $http['post']('/admin/api/check-in/' + ticket.eventId + '/ticket/' + ticket.uuid + '/manual-check-in', ticket);
        },

        confirmPayment: function(eventId, ticket) {
            var ticketIdentifier = ticket.code.split('/')[0];
            return $http['post']('/admin/api/check-in/' + eventId + '/ticket/' + ticketIdentifier + '/confirm-on-site-payment');
        }
    };
}]);



})();