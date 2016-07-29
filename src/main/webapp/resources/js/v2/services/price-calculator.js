(function () {

'use strict';


angular.module('adminApplication').service('PriceCalculator', function() {
    var instance = {
        calculateTotalPrice: function(event, viewMode) {
            if(isNaN(event.regularPrice) || isNaN(event.vat)) {
                return '0.00';
            }
            var vat = numeral(0.0);
            if((viewMode && angular.isDefined(event.id)) || !event.vatIncluded) {
                vat = instance.applyPercentage(event.regularPrice, event.vat);
            }
            return numeral(vat.add(event.regularPrice).format('0.00')).value();
        },
        calcBarValue: function(categorySeats, eventSeats) {
            return instance.calcPercentage(categorySeats, eventSeats).format('0.00');
        },
        calcCategoryPricePercent: function(category, event, editMode) {
            if(isNaN(event.regularPrice) || isNaN(category.price)) {
                return '0.00';
            }

            //TODO cleanup, not happy about that
            var regularPrice = event.regularPrice;
            if(editMode && event.vatIncluded) {
                regularPrice = instance.calculateTotalPrice(event, true);
            }
            //
            return instance.calcPercentage(category.price, regularPrice).format('0.00');
        },
        calcCategoryPrice: function(category, event) {
            if(isNaN(event.vat) || isNaN(category.price)) {
                return '0.00';
            }
            var vat = numeral(0.0);
            if(event.vatIncluded) {
                vat = instance.applyPercentage(category.price, event.vat);
            }
            return numeral(category.price).add(vat).format('0.00');
        },
        calcPercentage: function(fraction, total) {
            if(isNaN(fraction) || isNaN(total)){
                return numeral(0.0);
            }
            return numeral(numeral(fraction).divide(total).multiply(100).format('0.00'));
        },
        applyPercentage: function(total, percentage) {
            return numeral(numeral(percentage).divide(100).multiply(total).format('0.00'));
        }
    };
    return instance;
});



})();