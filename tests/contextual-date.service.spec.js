/* jshint -W117, -W030 */
describe('contextualDateService', function () {

    var lang;

    beforeEach(function () {
        bard.appModule('angular-contextual-date');
        bard.inject(this, 'contextualDateService', '$filter', '$document');

        lang = contextualDateService.languages.en_US;
    });

    describe('parse tests', function () {

        it('should parse a Date', function () {
            var date = new Date();
            var parsed = contextualDateService.parseDate(date);
            expect(date.getTime()).toEqual(parsed.getTime());
        });

        it('should parse an ISO string', function () {
            var date = new Date();
            var parsed = contextualDateService.parseDate(date.toISOString());
            expect(date.getTime()).toEqual(parsed.getTime());
        });

        it('should parse a UTC string', function () {
            var date = new Date();
            var parsed = contextualDateService.parseDate(date.toUTCString());

            // UTC strings lose milliseconds
            expect(Math.abs(date.getTime() - parsed.getTime()) <= 1000).toEqual(true, "date:" + date + ",parsed:" + parsed);
        });

        it('should parse an integer date', function () {
            var date = new Date();
            var parsed = contextualDateService.parseDate(date.getTime());
            expect(date.getTime()).toEqual(parsed.getTime());
        });

        it('should parse a string integer date', function () {
            var date = new Date();
            var parsed = contextualDateService.parseDate("" + date.getTime());
            expect(date.getTime()).toEqual(parsed.getTime());
        });

    });

    describe('formatRelative tests', function () {

        it('should return years', function () {
            var date = new Date();
            date.setFullYear(date.getFullYear() - 2);
            var converted = contextualDateService.formatRelative(date);
            expect(converted).toEqual([lang.prefix, 2, lang.years, lang.suffix].join(" ").trim());
        });

        it('should return year', function () {
            var date = new Date();
            date.setFullYear(date.getFullYear() - 1);
            var converted = contextualDateService.formatRelative(date);
            expect(converted).toEqual([lang.prefix, 1, lang.year, lang.suffix].join(" ").trim());
        });

        it('should return months', function () {
            var date = new Date();
            date.setDate(date.getDate() - 65);
            var converted = contextualDateService.formatRelative(date);
            expect(converted).toEqual([lang.prefix, 2, lang.months, lang.suffix].join(" ").trim());
        });

        it('should return month', function () {
            var date = new Date();
            date.setDate(date.getDate() - 31);
            var converted = contextualDateService.formatRelative(date);
            expect(converted).toEqual([lang.prefix, 1, lang.month, lang.suffix].join(" ").trim());
        });

        it('should return weeks', function () {
            var date = new Date();
            date.setDate(date.getDate() - 21);
            var converted = contextualDateService.formatRelative(date);
            expect(converted).toEqual([lang.prefix, 3, lang.weeks, lang.suffix].join(" ").trim());
        });

        it('should return week', function () {
            var date = new Date();
            date.setDate(date.getDate() - 7);
            var converted = contextualDateService.formatRelative(date);
            expect(converted).toEqual([lang.prefix, 1, lang.week, lang.suffix].join(" ").trim());
        });

        it('should return days', function () {
            var date = new Date();
            date.setDate(date.getDate() - 3);
            var converted = contextualDateService.formatRelative(date);
            expect(converted).toEqual([lang.prefix, 3, lang.days, lang.suffix].join(" ").trim());
        });

        it('should return day', function () {
            var date = new Date();
            date.setDate(date.getDate() - 1);
            var converted = contextualDateService.formatRelative(date);
            expect(converted).toEqual([lang.prefix, 1, lang.day, lang.suffix].join(" ").trim());
        });

        it('should return hours', function () {
            var date = new Date();
            date.setHours(date.getHours() - 3);
            var converted = contextualDateService.formatRelative(date);
            expect(converted).toEqual([lang.prefix, 3, lang.hours, lang.suffix].join(" ").trim());
        });

        it('should return hour', function () {
            var date = new Date();
            date.setHours(date.getHours() - 1);
            var converted = contextualDateService.formatRelative(date);
            expect(converted).toEqual([lang.prefix, 1, lang.hour, lang.suffix].join(" ").trim());
        });

        it('should return minutes', function () {
            var date = new Date();
            date.setMinutes(date.getMinutes() - 3);
            var converted = contextualDateService.formatRelative(date);
            expect(converted).toEqual([lang.prefix, 3, lang.minutes, lang.suffix].join(" ").trim());
        });

        it('should return minute', function () {
            var date = new Date();
            date.setMinutes(date.getMinutes() - 1);
            var converted = contextualDateService.formatRelative(date);
            expect(converted).toEqual([lang.prefix, 1, lang.minute, lang.suffix].join(" ").trim());
        });
    
        it('should return seconds', function () {
            var date = new Date();
            date.setSeconds(date.getSeconds() - 3);
            var converted = contextualDateService.formatRelative(date);
            expect(converted).toEqual([lang.prefix, 3, lang.seconds, lang.suffix].join(" ").trim());
        });

        it('should return second', function () {
            var date = new Date();
            date.setSeconds(date.getSeconds() - 1);
            var converted = contextualDateService.formatRelative(date);
            expect(converted).toEqual([lang.prefix, 1, lang.second, lang.suffix].join(" ").trim());
        });

        it('should return milliseconds', function () {
            var date = new Date();
            // have to pass in now directly since we can't rely on whoever's computer is running this test
            // to do it in under a millisecond
            var now = new Date(date.getTime());
            now.setMilliseconds(now.getMilliseconds() + 3);
            
            var converted = contextualDateService.formatRelative(date, now);

            expect(converted).toEqual([lang.prefix, 3, lang.milliseconds, lang.suffix].join(" ").trim());
        });

        it('should return millisecond', function () {
            var date = new Date();
            // have to pass in now directly since we can't rely on whoever's computer is running this test
            // to do it in under a millisecond
            var now = new Date(date.getTime());
            now.setMilliseconds(now.getMilliseconds() + 1);
            
            var converted = contextualDateService.formatRelative(date, now);

            expect(converted).toEqual([lang.prefix, 1, lang.millisecond, lang.suffix].join(" ").trim());
        });

        it('should return now', function () {
            var date = new Date();
            // have to pass in now directly since we can't rely on whoever's computer is running this test
            // to do it immediately
            var now = new Date(date.getTime());
            
            var converted = contextualDateService.formatRelative(date, now);

            expect(converted).toEqual(lang.now);
        });

        it('should return future date', function () {
            var date = new Date();
            date.setDate(date.getDate() + 5);

            var converted = contextualDateService.formatRelative(date);

            expect(converted).toEqual([lang.futurePrefix, 5, lang.days, lang.futureSuffix].join(" ").trim());
        })

        it('should return bad input untouched', function () {
            var date = "garbage";
            var converted = contextualDateService.formatRelative(date);
            expect(converted).toEqual(date);
        });
    });

    describe('formatFull tests', function () {
        it('should format the today format', function () {
            var date = new Date();
            var converted = contextualDateService.formatFull(date);
            var today = $filter('date')(date, contextualDateService.config.fullDateFormats.today);

            expect(converted).toEqual(today);
        });

        it('should format this month format', function () {
            var date = new Date();
            date.setDate(date.getDate() - 3);
            var converted = contextualDateService.formatFull(date);
            var thisMonth = $filter('date')(date, contextualDateService.config.fullDateFormats.thisMonth);

            expect(converted).toEqual(thisMonth);
        });

        it('should format this year format', function () {
            var date = new Date();
            date.setDate(date.getDate() - 60);
            var converted = contextualDateService.formatFull(date);
            var thisYear = $filter('date')(date, contextualDateService.config.fullDateFormats.thisYear);
            expect(converted).toEqual(thisYear);
        });

        it('should format the historical format', function () {
            var date = new Date();
            date.setFullYear(date.getFullYear() - 2);
            var converted = contextualDateService.formatFull(date);
            var historical = $filter('date')(date, contextualDateService.config.fullDateFormats.historical);

            expect(converted).toEqual(historical);
        });

        it('should format the next month format', function () {
            var date = new Date();
            date.setDate(date.getDate() + 3);
            var converted = contextualDateService.formatFull(date);
            var nextMonth = $filter('date')(date, contextualDateService.config.fullDateFormats.nextMonth);

            expect(converted).toEqual(nextMonth);
        });

        it('should format the next year format', function () {
            var date = new Date();
            date.setDate(date.getDate() + 60);
            var converted = contextualDateService.formatFull(date);
            var nextYear = $filter('date')(date, contextualDateService.config.fullDateFormats.nextYear);
            expect(converted).toEqual(nextYear);
        });

        it('should format the future format', function () {
            var date = new Date();
            date.setFullYear(date.getFullYear() + 2);
            var converted = contextualDateService.formatFull(date);
            var future = $filter('date')(date, contextualDateService.config.fullDateFormats.future);
            expect(converted).toEqual(future);
        });

        it('should return bad input untouched', function () {
            var date = "garbage";
            var converted = contextualDateService.formatFull(date);
            expect(converted).toEqual(date);
        });

    });

    describe('format tests', function () {
        it('should format the relative and full portions of the date', function () {
            var date = new Date();
            date.setDate(date.getDate() - 3);
            spyOn(contextualDateService, "formatFull").and.callThrough();
            spyOn(contextualDateService, "formatRelative").and.callThrough();
            var converted = contextualDateService.format(date);

            expect(contextualDateService.formatFull).toHaveBeenCalled();
            expect(contextualDateService.formatRelative).toHaveBeenCalled();
        });

        it('should respect the override', function () {
            var date = new Date();
            date.setDate(date.getDate() - 3);
            var override = "garbage";
            var converted = contextualDateService.format(date, override);
            var format = contextualDateService.config.contextualDateFormat;
            var formatted = format.replace('%fullDate%', override).replace('%relativeDate%', "3 days ago");

            expect(formatted).toEqual(converted);
        });

        it('should return invalid input untouched', function () {
            var date = "garbage";
            var converted = contextualDateService.format(date);
            expect(converted).toEqual(date);
        });
    });

    describe('configuration tests', function () {

        var formatFullSpy, formatRelativeSpy;

        beforeEach(function () {
            spyOn(contextualDateService, "formatFull").and.callThrough();
            spyOn(contextualDateService, "formatRelative").and.callThrough();
        });

        it('should only display the relative format', function () {
            var date = new Date();
            date.setDate(date.getDate() - 1);
            contextualDateService.config.hideFullDate = true;

            var converted = contextualDateService.format(date);
            var relativeDate = contextualDateService.formatRelative(date);

            expect(converted).toEqual(relativeDate);
            expect(contextualDateService.formatRelative.calls.count()).toEqual(2);
            expect(contextualDateService.formatFull).not.toHaveBeenCalled();

        });

        it('should modify the formats', function () {
            var date = new Date();

            contextualDateService.config.fullDateFormats.today = "yyyy";
            var relativeDate = contextualDateService.formatFull(date);

            expect(relativeDate).toEqual("" + date.getFullYear());
        });

        it('should modify the thresholds', function () {
            var date = new Date();
            date.setDate(date.getDate() - 8);
            var rel1 = contextualDateService.formatRelative(date);

            contextualDateService.config.thresholds.week = 1.5;
            var rel2 = contextualDateService.formatRelative(date);

            expect(rel1).not.toEqual(rel2);
            expect(rel1).toEqual([lang.prefix, 1, lang.week, lang.suffix].join(" ").trim());
            expect(rel2).toEqual([lang.prefix, 8, lang.days, lang.suffix].join(" ").trim());
        });

        it('should take language from DOM', function () {
            contextualDateService.languages["FAKE"] = { day : "wassup"};
            $document[0].documentElement.lang = "FAKE";
            var date = new Date();
            date.setDate(date.getDate() - 1);
            var converted = contextualDateService.formatRelative(date);

            expect(converted).toEqual("1 wassup");
        });

        it('should take language from config', function () {
            contextualDateService.languages["FAKE"] = { day : "!!!" };
            contextualDateService.config.language = "FAKE";
            var date = new Date();
            date.setDate(date.getDate() - 1);
            var converted = contextualDateService.formatRelative(date);

            expect(converted).toEqual("1 !!!");
        });

        it("should prioritize config over DOM", function () {
            contextualDateService.languages["DOM"] = { day : "DOM" };
            contextualDateService.languages["CONF"] = { day : "CONF" };
            $document[0].documentElement.lang = "DOM";
            contextualDateService.config.language = "CONF";

            var date = new Date();
            date.setDate(date.getDate() - 1);
            var converted = contextualDateService.formatRelative(date);

            expect(converted).toEqual("1 CONF");
        });

        it("should ignore bad language configurations", function () {
            contextualDateService.config.language = "Garbage1";
            $document[0].documentElement.lang = "Garbage2";

            var date = new Date();
            date.setDate(date.getDate() - 1);
            var converted = contextualDateService.formatRelative(date);

            expect(converted).toEqual("1 day ago");
        });
    });

});