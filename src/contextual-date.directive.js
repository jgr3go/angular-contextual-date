(function () {
'use strict';

angular
    .module('angular-contextual-date')
    .directive('contextualDate', contextualDateDirective);

contextualDateDirective.$inject = [];
function contextualDateDirective () {
    var directive = {
        scope : {
            datetime: "=",
            timezone: "="
        },
        restrict: "EA",
        controller: ContextualDateController,
        controllerAs: "CDC",
        template: "<span ng-bind='CDC.cDateFormatted'></span>",
        bindToController: true
    };

    return directive;
}

ContextualDateController.$inject = ['contextualDateService'];
function ContextualDateController (contextualDateService) {
    var vm = this;

    // Directive variables
    // vm.datetime
    // vm.timezone

    // Local variables
    vm.cDateFormatted = "";

    activate();

    function activate () {
        vm.cDateFormatted = contextualDateService.format(
            vm.datetime,
            null, /* overrideDate */
            vm.timezone
        );
    }
}

})();
