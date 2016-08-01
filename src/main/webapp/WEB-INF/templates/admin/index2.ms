<!DOCTYPE html>
<html lang="en" ng-app="adminApplication" ng-csp {{#basicConfigurationNeeded}}data-basic-configuration-needed{{/basicConfigurationNeeded}}>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <meta name="_csrf" content="{{_csrf.token}}">
        <meta name="_csrf_header" content="{{_csrf.headerName}}">

        <!-- base material style -->
        <link rel="stylesheet" href="{{request.contextPath}}/resources/css/v2/angular-material.min.css">

        <!-- common css -->
        <link rel="stylesheet" href="{{request.contextPath}}/resources/css/v2/common.css">

        <!-- misc libs -->
        <script src="{{request.contextPath}}/resources/bower_components/moment/min/moment-with-locales.min.js"></script>
        <script src="{{request.contextPath}}/resources/bower_components/numeral/min/numeral.min.js"></script>
        <script src="{{request.contextPath}}/resources/bower_components/Chart.js/Chart.min.js"></script>
        <!-- -->

        <!-- angular base -->
        <script src="{{request.contextPath}}/resources/js/v2/lib/angular.min.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/lib/angular-animate.min.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/lib/angular-aria.min.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/lib/angular-messages.min.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/lib/angular-sanitize.min.js"></script>

        <!-- routing -->
        <script src="{{request.contextPath}}/resources/js/v2/lib/angular-ui-router.min.js"></script>

        <!-- material -->
        <script src="{{request.contextPath}}/resources/js/v2/lib/angular-material.min.js"></script>

        <!-- angular chart -->
        <script src="{{request.contextPath}}/resources/bower_components/angular-chart.js/angular-chart.js"></script>


        <!-- main app -->
        <script src="{{request.contextPath}}/resources/js/v2/app.js"></script>

        <!-- components -->
        <script src="{{request.contextPath}}/resources/js/v2/components/page-home/page-home.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/components/page-new-event/page-new-event.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/components/page-new-external-event/page-new-external-event.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/components/page-event-email-log/page-event-email-log.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/components/page-event-plugin-log/page-event-plugin-log.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/components/page-event/page-event.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/components/page-event-additional-fields/page-event-additional-fields.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/components/page-event-donation-handling/page-event-donation-handling.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/components/page-event-promo-codes/page-event-promo-codes.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/components/page-event-tickets-categories/page-event-tickets-categories.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/components/page-event-waiting-queue/page-event-waiting-queue.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/components/ticket-status/ticket-status.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/components/navigation-event/navigation-event.js"></script>

        <!-- services -->
        <script src="{{request.contextPath}}/resources/js/v2/services/event.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/services/email.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/services/plugin.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/services/user.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/services/organization.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/services/price-calculator.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/services/promo-code.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/services/additional-service.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/services/waiting-queue.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/services/http-error-handler.js"></script>

        <!-- filters -->
        <script src="{{request.contextPath}}/resources/js/v2/filters/format-date.js"></script>
        <script src="{{request.contextPath}}/resources/js/v2/filters/truncate-string.js"></script>

    </head>
    <body layout="column">
        <md-toolbar>
            <div class="md-toolbar-tools">
                <h2><a class="navbar-brand logo title" ui-sref="index">Alf.io</a></h2>
            </div>
        </md-toolbar>
        <div role="main" ui-view="main" flex layout="row"></div>
    </body>
</html>