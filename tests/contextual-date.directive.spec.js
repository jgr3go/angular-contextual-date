/* jshint -W117, -W030 */
describe('contextualDateDirective', function () {
    var scope;
    var element;
    var ctrl;

    var EL_TEMPLATE = [
        "<contextual-date",
        "datetime='datetime'",
        "timezone='timezone'",
        ">",
        "</contextual-date>"
    ].join(" ");

    var AT_TEMPLATE = [
        "<div ",
        "contextual-date",
        "ng-attr-datetime='datetime'",
        ">",
        "</div>"
    ].join(" ");

    //beforeEach(module('my.templates'));
    beforeEach(function () {
        bard.appModule('angular-contextual-date')
        bard.inject('contextualDateService');
    });

    describe("Element - converted date shows up", function () {
        beforeEach(inject(function ($rootScope) {
            scope = $rootScope.$new();
            var date = new Date();
            date.setDate(date.getDate() - 2);
            
            scope.datetime = date;
        
            inject(function ($compile) {
                element = $compile(EL_TEMPLATE)(scope);
                element.scope().$apply();
            });
            ctrl = element.controller("contextualDate");

        }));

        it('should be defined', function () {
            expect(element).to.exist;
            expect(ctrl).to.exist;

            expect(ctrl.datetime).to.be.equal(scope.datetime);
            expect(ctrl.timezone).to.be.equal(scope.timezone);
        });

        describe("values changed", function () {
            it('should replicate incoming changes: @scopes: []', function () {
                // this directive has no @ scopes
            });

            it('should not replicate outgoing changes: @scopes: []', function () {
                // this directive has no @ scopes
            });

            it("should replicate incoming changes: =scopes: [datetime, timezone]", function () {
                // modify scope
                scope.datetime = Date.now() - 1000;
                scope.timezone = "UTC";

                element.scope().$apply();

                // verify scope == ctrl
                expect(scope.datetime).to.be.equal(ctrl.datetime);
                expect(scope.timezone).to.be.equal(ctrl.timezone);
            });

            it("should replicate outgoing changes: =scopes: [datetime, timezone]", function () {
                // modify ctrl
                ctrl.datetime = Date.now() - 1000;
                ctrl.timezone = "UTC";

                element.scope().$apply();

                // verify scope not affected
                expect(scope.datetime).to.be.equal(ctrl.datetime);
                expect(scope.timezone).to.be.equal(ctrl.timezone);
            });
        });
        
    });

    describe("Attribute - converted date shows up", function () {
        beforeEach(inject(function ($rootScope) {
            scope = $rootScope.$new();
            var date = new Date();
            date.setDate(date.getDate() - 2);
            
            scope.datetime = date;
        
            inject(function ($compile) {
                element = $compile(AT_TEMPLATE)(scope);
                element.scope().$apply();
            });
            ctrl = element.controller("contextualDate");

        }));

        it('should be defined', function () {
            expect(element).to.exist;
            expect(ctrl).to.exist;

            expect(ctrl.datetime).to.be.equal(scope.datetime);
        });
    });

});

    