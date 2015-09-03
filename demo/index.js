(function () {
'use strict';

angular
    .module('myApp', [
        "angular-contextual-date"
    ]);

angular
    .module('myApp')
    .controller('appCtrl', appCtrl);

appCtrl.$inject = ['contextualDateService'];

function appCtrl (contextualDateService) {
    var vm = this;

    vm.openedDocAt = null;
    vm.docWrittenAt = null;
    vm.authorBirth = null;
    vm.examples = [];

    activate();
    function activate () {
        vm.openedDocAt = new Date();
        vm.docWrittenAt = new Date(2015, 6, 28, 17, 33, 22);

        var now = new Date();
        
        // dates in the past
        vm.examples.push(now.setTime(now.getTime()));
        vm.examples.push(now.setSeconds(now.getSeconds() - 1));
        vm.examples.push(now.setMinutes(now.getMinutes() - 1));
        vm.examples.push(now.setHours(now.getHours() - 2));
        vm.examples.push(now.setDate(now.getDate() - 2));
        vm.examples.push(now.setDate(now.getDate() - 7));
        vm.examples.push(now.setMonth(now.getMonth() - 2));
        vm.examples.push(now.setFullYear(now.getFullYear() - 5));

        // dates in the future
        now = new Date();
        vm.examples.push(now.setDate(now.getDate() + 2));
        vm.examples.push(now.setMonth(now.getMonth() + 2));
        vm.examples.push(now.setFullYear(now.getFullYear() + 5));

    }
}

})();
