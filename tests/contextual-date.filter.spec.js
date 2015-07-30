/* jshint -W117, -W030 */
describe('contextualDateFilter', function () {
    
    var lang, past;


    beforeEach(function () {
        bard.appModule('angular-contextual-date');
        bard.inject(this, 'contextualDateService', '$filter', 'contextualDateFilter');

        lang = contextualDateService.languages.en_US;
        past = lang.past;

        spyOn(contextualDateService, "format");
    });

    describe("filter calls contextualDateService service", function () {

        it('should call the service', function () {
            var date = new Date();
            contextualDateFilter(date, null);

            expect(contextualDateService.format.calls.count()).toEqual(1);
            expect(contextualDateService.format).toHaveBeenCalledWith(date, null, null);
        });
    });

});

