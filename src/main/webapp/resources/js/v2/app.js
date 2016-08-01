(function() {

'use strict';


initChartJs();


var module = angular.module('adminApplication', ['ngSanitize', 'ngMessages', 'ngMaterial', 'ui.router', 'chart.js']);

var EVENT_SHORT_NAME_RESOLVER = {
    eventShortName: function($stateParams) {
        return $stateParams.eventName;
    },
    eventAndOrganization: function($stateParams, EventService) {
        return EventService.getEvent($stateParams.eventName).then(function(res) {return res.data});
    }

};

function eventViews(component) {
    return {
        event: { template: '<'+component+' event-short-name="::$resolve.eventShortName" event-and-organization="::$resolve.eventAndOrganization" flex></'+component+'</>'}, //component is not able to add a custom attributes ???
        sidenav: {template: '<navigation-event event-short-name="::$resolve.eventShortName" event-and-organization="::$resolve.eventAndOrganization" flex layout="row"></navigation-event>'}
    };
}

module.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('index', {
            url: '/',
            views: {main: {component: 'pageHome'}}
        })
        .state('newEvent', {
            url: '/new-event',
            views: {main: {component: 'pageNewEvent'}}
        })
        .state('newExternalEvent', {
            url: '/new-external-event',
            views: {main: {component: 'pageNewExternalEvent'}}
        })
        .state('event', {
            abstract: 'true',
            url: '/event/:eventName/',
            views: {main: {template: '<div flex layout="row"><div ui-view="sidenav" layout="row"></div><md-content md-scroll-y ui-view="event" layout="row" flex></md-content></div>'}}
        })
        .state('event.detail', {
            url: '',
            resolve: EVENT_SHORT_NAME_RESOLVER,
            views: eventViews('page-event')
        })
        .state('event.ticketsCategories', {
            url: 'tickets-categories/',
            resolve: EVENT_SHORT_NAME_RESOLVER,
            views: eventViews('page-event-tickets-categories')
        })
        .state('event.promoCodes', {
            url: 'promo-codes/',
            resolve: EVENT_SHORT_NAME_RESOLVER,
            views: eventViews('page-event-promo-codes')
        })
        .state('event.additionalFields', {
            url: 'additional-fields/',
            resolve: EVENT_SHORT_NAME_RESOLVER,
            views: eventViews('page-event-additional-fields')
        })
        .state('event.donationHandling', {
            url: 'donation-handling/',
            resolve: EVENT_SHORT_NAME_RESOLVER,
            views: eventViews('page-event-donation-handling')
        })
        .state('event.emailLog', {
            url: 'email-log/',
            resolve: EVENT_SHORT_NAME_RESOLVER,
            views: eventViews('page-event-email-log')
        })
        .state('event.pluginLog', {
            url: 'plugin-log/',
            resolve: EVENT_SHORT_NAME_RESOLVER,
            views: eventViews('page-event-plugin-log')
        })
        .state('event.waitingQueue', {
            url: 'waiting-queue/',
            resolve: EVENT_SHORT_NAME_RESOLVER,
            views: eventViews('page-event-waiting-queue')
        })
        .state('event.pendingReservations', {
            url: 'pending-reservations/',
            resolve: EVENT_SHORT_NAME_RESOLVER,
            views: eventViews('page-event-pending-reservations')
        });
    $urlRouterProvider.otherwise("/");
});


function initChartJs() {
    var printLabel = function(val) {
        return val.label + ' ('+ val.value +')';
    };

    Chart.defaults.global.multiTooltipTemplate = function(val) {
        return printLabel(val);
    };
    Chart.defaults.global.tooltipTemplate = function(val) {
        return printLabel(val);
    };
    Chart.defaults.global.colours = [
        { // yellow
            fillColor: "rgba(253,180,92,0.2)",
            strokeColor: "rgba(253,180,92,1)",
            pointColor: "rgba(253,180,92,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(253,180,92,0.8)"
        },
        { // green
            fillColor: "rgba(70,191,189,0.2)",
            strokeColor: "rgba(70,191,189,1)",
            pointColor: "rgba(70,191,189,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(70,191,189,0.8)"
        },
        { // blue
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,0.8)"
        },
        { // light grey
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,0.8)"
        },
        { // purple
            fillColor: "rgba(158,31,255,0.2)",
            strokeColor: "rgba(158,31,255,1)",
            pointColor: "rgba(158,31,255,0.2)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(158,31,255,0.8)"
        }];

}



})()