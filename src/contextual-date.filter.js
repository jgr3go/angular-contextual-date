(function () {
'use strict';

angular
    .module('angular-contextual-date')
    .filter('contextualDate', contextualDateFilter);

contextualDateFilter.$inject = ['contextualDateService'];

function contextualDateFilter (contextualDateService) {
    return filter;

    function filter (value, timezone) {
        return contextualDateService.format(value, null, timezone);
    }
}

})();
