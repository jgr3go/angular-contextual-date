(function () {
'use strict';

angular.module('angular-contextual-date', []);

})();

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

(function () {
'use strict';

angular
    .module('angular-contextual-date')
    .factory('contextualDateService', contextualDateService);

contextualDateService.$inject = ["$filter", "$document"];

function contextualDateService ($filter, $document) {
    var service = {
        // functions
        format: format,
        formatRelative: formatRelative,
        formatFull: formatFull,
        parseDate: parseDate,

        // configurations
        config: {
            hideFullDate : false,

            fullDateFormats : {
                today: "h:mm a",
                thisMonth: "MMM d 'at' h:mm a",
                thisYear: "MMM d",
                historical: "MMM d, y"
            },

            contextualDateFormat: "%fullDate% (%relativeDate%)",

            language: null, // this will hard set the language

            thresholds: {
                years: 1.75,
                year: 0.75,
                months: 1.75,
                month: 0.9,
                weeks: 1.75,
                week: 1.0,
                days: 2.0,
                day: 1.0,
                hours: 2.0,
                hour: 1.0,
                minutes: 2.0,
                minute: 1.0,
                seconds: 2.0,
                second: 1.0,
                milliseconds: 2.0,
                millisecond: 1.0
            }
        },

        // language support
        languages : {
            'en_US': {

                now: "just now",

                prefix: "",
                suffix: "ago",
                
                millisecond: "millisecond",
                milliseconds: "milliseconds",
                second: "second",
                seconds: "seconds",
                minute: "minute",
                minutes: "minutes",
                hour: "hour",
                hours: "hours",
                day: "day",
                days: "days",
                week: "week",
                weeks: "weeks",
                month: "month",
                months: "months",
                year: "year",
                years: "years"
            }
        }
    };

    return service;

    function format (date, fullDateOverride, timezone) {
        var ldate = service.parseDate(date);

        // We weren't able to parse the date, just return as is
        if (isNaN(ldate)) { return date; }

        var now = new Date();
        var fullDate, relativeDate;

        relativeDate = service.formatRelative(ldate, now);

        if (service.config.hideFullDate) {
            return relativeDate;
        }

        if (fullDateOverride) {
            fullDate = fullDateOverride;
        } else {
            fullDate = service.formatFull(ldate, now, timezone);
        }

        var formatter = service.config.contextualDateFormat;
        var result = formatter
                                        .replace('%fullDate%', fullDate)
                                        .replace('%relativeDate%', relativeDate);

        return result;
    }

    function formatFull(date, now, timezone) {
        var ldate = service.parseDate(date);
        if (isNaN(ldate)) { return date; }

        now = now || new Date();

        var fullDate = "";
        var thresholds = service.config.thresholds;

        var isToday = (ldate.getDate() === now.getDate() &&
                                        ldate.getMonth() === now.getMonth() &&
                                        ldate.getFullYear() === now.getFullYear());
        
        var thisMonth = new Date(now.getTime());
        thisMonth.setDate(thisMonth.getDate() - Math.round(thresholds.month * 31));
        var isThisMonth = (ldate.getTime() - thisMonth.getTime() >= 0);

        var thisYear = new Date(now.getTime());
        thisYear.setDate(thisYear.getDate() - Math.round(thresholds.year * 365));
        var isThisYear = (ldate.getTime() - thisYear.getTime() >= 0);

        var $dateFilter = $filter('date');
        var dateFormats = service.config.fullDateFormats;

        if (isToday) {
            fullDate = $dateFilter(ldate, dateFormats.today, timezone);
        }
        else if (isThisMonth) {
            fullDate = $dateFilter(ldate, dateFormats.thisMonth, timezone);
        }
        else if (isThisYear) {
            fullDate = $dateFilter(ldate, dateFormats.thisYear, timezone);
        }
        else {
            fullDate = $dateFilter(ldate, dateFormats.historical, timezone);
        }

        return fullDate;
    }

    function pad(args) {
        return Array.prototype.join.call(arguments, " ").trim();
    }

    function getLang() {
        var slang = service.config.language;
        var dlang = $document[0].documentElement.lang;
        var lang;

        if (slang) {
            lang = service.languages[slang];
        }
        if (!lang && dlang) {
            lang = service.languages[dlang];
        }
        if (!lang) {
            lang = service.languages.en_US;
        }

        return lang;
    }

    function formatRelative(date, now) {
        var ldate = service.parseDate(date);
        if (isNaN(ldate)) { return date; }
        now = now || new Date();

        var lang = getLang();
        var diff = now.getTime() - ldate.getTime();

        var milliseconds = diff;
        var seconds = milliseconds / 1000;
        var minutes = seconds / 60;
        var hours = minutes / 60;
        var days = hours / 24;
        var weeks = days / 7;
        var months = days / 30;
        var years = days / 365;

        var relative = "";

        var th = service.config.thresholds;

        if (years >= th.years) {
            relative = pad(Math.round(years), lang.years);
        } else if (years >= th.year) {
            relative = pad(1, lang.year);
        } else if (months >= th.months) {
            relative = pad(Math.round(months), lang.months);
        } else if (months >= th.month) {
            relative = pad(1, lang.month);
        } else if (weeks >= th.weeks) {
            relative = pad(Math.round(weeks), lang.weeks);
        } else if (weeks >= th.week) {
            relative = pad(1, lang.week);
        } else if (days >= th.days) {
            relative = pad(Math.round(days), lang.days);
        } else if (days >= th.day) {
            relative = pad(1, lang.day);
        } else if (hours >= th.hours) {
            relative = pad(Math.round(hours), lang.hours);
        } else if (hours >= th.hour) {
            relative = pad(1, lang.hour);
        } else if (minutes >= th.minutes) {
            relative = pad(Math.round(minutes), lang.minutes);
        } else if (minutes >= th.minute) {
            relative = pad(1, lang.minute);
        } else if (seconds >= th.seconds) {
            relative = pad(Math.round(seconds), lang.seconds);
        } else if (seconds >= th.second) {
            relative = pad(1, lang.second);
        } else if (milliseconds >= th.milliseconds) {
            relative = pad(Math.round(milliseconds), lang.milliseconds);
        } else if (milliseconds >= th.millisecond) {
            relative = pad(1, lang.millisecond);
        }

        if (!relative) {
            relative = lang.now;
        } else {
            relative = pad(lang.prefix, relative, lang.suffix);
        }

        return relative;
    }

    function parseDate (input) {
        if (input instanceof Date) {
            return input;
        // date.getTime();
        } else if (angular.isNumber(input)) {
            return new Date(input);
        // date.getTime(); as string
        } else if (/^\d+$/.test(input)) {
            return new Date(parseInt(input, 10));
        // ISO / UTC
        } else {
            return new Date(input);
        }
    }
}

})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnRleHR1YWwtZGF0ZS5tb2R1bGUuanMiLCJjb250ZXh0dWFsLWRhdGUuZGlyZWN0aXZlLmpzIiwiY29udGV4dHVhbC1kYXRlLmZpbHRlci5qcyIsImNvbnRleHR1YWwtZGF0ZS5zZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFuZ3VsYXItY29udGV4dHVhbC1kYXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uICgpIHtcclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2FuZ3VsYXItY29udGV4dHVhbC1kYXRlJywgW10pO1xyXG5cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYW5ndWxhci1jb250ZXh0dWFsLWRhdGUnKVxyXG4gICAgLmRpcmVjdGl2ZSgnY29udGV4dHVhbERhdGUnLCBjb250ZXh0dWFsRGF0ZURpcmVjdGl2ZSk7XHJcblxyXG5jb250ZXh0dWFsRGF0ZURpcmVjdGl2ZS4kaW5qZWN0ID0gW107XHJcbmZ1bmN0aW9uIGNvbnRleHR1YWxEYXRlRGlyZWN0aXZlICgpIHtcclxuICAgIHZhciBkaXJlY3RpdmUgPSB7XHJcbiAgICAgICAgc2NvcGUgOiB7XHJcbiAgICAgICAgICAgIGRhdGV0aW1lOiBcIj1cIixcclxuICAgICAgICAgICAgdGltZXpvbmU6IFwiPVwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXN0cmljdDogXCJFQVwiLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IENvbnRleHR1YWxEYXRlQ29udHJvbGxlcixcclxuICAgICAgICBjb250cm9sbGVyQXM6IFwiQ0RDXCIsXHJcbiAgICAgICAgdGVtcGxhdGU6IFwiPHNwYW4gbmctYmluZD0nQ0RDLmNEYXRlRm9ybWF0dGVkJz48L3NwYW4+XCIsXHJcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZVxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG59XHJcblxyXG5Db250ZXh0dWFsRGF0ZUNvbnRyb2xsZXIuJGluamVjdCA9IFsnY29udGV4dHVhbERhdGVTZXJ2aWNlJ107XHJcbmZ1bmN0aW9uIENvbnRleHR1YWxEYXRlQ29udHJvbGxlciAoY29udGV4dHVhbERhdGVTZXJ2aWNlKSB7XHJcbiAgICB2YXIgdm0gPSB0aGlzO1xyXG5cclxuICAgIC8vIERpcmVjdGl2ZSB2YXJpYWJsZXNcclxuICAgIC8vIHZtLmRhdGV0aW1lXHJcbiAgICAvLyB2bS50aW1lem9uZVxyXG5cclxuICAgIC8vIExvY2FsIHZhcmlhYmxlc1xyXG4gICAgdm0uY0RhdGVGb3JtYXR0ZWQgPSBcIlwiO1xyXG5cclxuICAgIGFjdGl2YXRlKCk7XHJcblxyXG4gICAgZnVuY3Rpb24gYWN0aXZhdGUgKCkge1xyXG4gICAgICAgIHZtLmNEYXRlRm9ybWF0dGVkID0gY29udGV4dHVhbERhdGVTZXJ2aWNlLmZvcm1hdChcclxuICAgICAgICAgICAgdm0uZGF0ZXRpbWUsXHJcbiAgICAgICAgICAgIG51bGwsIC8qIG92ZXJyaWRlRGF0ZSAqL1xyXG4gICAgICAgICAgICB2bS50aW1lem9uZVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbmFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2FuZ3VsYXItY29udGV4dHVhbC1kYXRlJylcclxuICAgIC5maWx0ZXIoJ2NvbnRleHR1YWxEYXRlJywgY29udGV4dHVhbERhdGVGaWx0ZXIpO1xyXG5cclxuY29udGV4dHVhbERhdGVGaWx0ZXIuJGluamVjdCA9IFsnY29udGV4dHVhbERhdGVTZXJ2aWNlJ107XHJcblxyXG5mdW5jdGlvbiBjb250ZXh0dWFsRGF0ZUZpbHRlciAoY29udGV4dHVhbERhdGVTZXJ2aWNlKSB7XHJcbiAgICByZXR1cm4gZmlsdGVyO1xyXG5cclxuICAgIGZ1bmN0aW9uIGZpbHRlciAodmFsdWUsIHRpbWV6b25lKSB7XHJcbiAgICAgICAgcmV0dXJuIGNvbnRleHR1YWxEYXRlU2VydmljZS5mb3JtYXQodmFsdWUsIG51bGwsIHRpbWV6b25lKTtcclxuICAgIH1cclxufVxyXG5cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYW5ndWxhci1jb250ZXh0dWFsLWRhdGUnKVxyXG4gICAgLmZhY3RvcnkoJ2NvbnRleHR1YWxEYXRlU2VydmljZScsIGNvbnRleHR1YWxEYXRlU2VydmljZSk7XHJcblxyXG5jb250ZXh0dWFsRGF0ZVNlcnZpY2UuJGluamVjdCA9IFtcIiRmaWx0ZXJcIiwgXCIkZG9jdW1lbnRcIl07XHJcblxyXG5mdW5jdGlvbiBjb250ZXh0dWFsRGF0ZVNlcnZpY2UgKCRmaWx0ZXIsICRkb2N1bWVudCkge1xyXG4gICAgdmFyIHNlcnZpY2UgPSB7XHJcbiAgICAgICAgLy8gZnVuY3Rpb25zXHJcbiAgICAgICAgZm9ybWF0OiBmb3JtYXQsXHJcbiAgICAgICAgZm9ybWF0UmVsYXRpdmU6IGZvcm1hdFJlbGF0aXZlLFxyXG4gICAgICAgIGZvcm1hdEZ1bGw6IGZvcm1hdEZ1bGwsXHJcbiAgICAgICAgcGFyc2VEYXRlOiBwYXJzZURhdGUsXHJcblxyXG4gICAgICAgIC8vIGNvbmZpZ3VyYXRpb25zXHJcbiAgICAgICAgY29uZmlnOiB7XHJcbiAgICAgICAgICAgIGhpZGVGdWxsRGF0ZSA6IGZhbHNlLFxyXG5cclxuICAgICAgICAgICAgZnVsbERhdGVGb3JtYXRzIDoge1xyXG4gICAgICAgICAgICAgICAgdG9kYXk6IFwiaDptbSBhXCIsXHJcbiAgICAgICAgICAgICAgICB0aGlzTW9udGg6IFwiTU1NIGQgJ2F0JyBoOm1tIGFcIixcclxuICAgICAgICAgICAgICAgIHRoaXNZZWFyOiBcIk1NTSBkXCIsXHJcbiAgICAgICAgICAgICAgICBoaXN0b3JpY2FsOiBcIk1NTSBkLCB5XCJcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGNvbnRleHR1YWxEYXRlRm9ybWF0OiBcIiVmdWxsRGF0ZSUgKCVyZWxhdGl2ZURhdGUlKVwiLFxyXG5cclxuICAgICAgICAgICAgbGFuZ3VhZ2U6IG51bGwsIC8vIHRoaXMgd2lsbCBoYXJkIHNldCB0aGUgbGFuZ3VhZ2VcclxuXHJcbiAgICAgICAgICAgIHRocmVzaG9sZHM6IHtcclxuICAgICAgICAgICAgICAgIHllYXJzOiAxLjc1LFxyXG4gICAgICAgICAgICAgICAgeWVhcjogMC43NSxcclxuICAgICAgICAgICAgICAgIG1vbnRoczogMS43NSxcclxuICAgICAgICAgICAgICAgIG1vbnRoOiAwLjksXHJcbiAgICAgICAgICAgICAgICB3ZWVrczogMS43NSxcclxuICAgICAgICAgICAgICAgIHdlZWs6IDEuMCxcclxuICAgICAgICAgICAgICAgIGRheXM6IDIuMCxcclxuICAgICAgICAgICAgICAgIGRheTogMS4wLFxyXG4gICAgICAgICAgICAgICAgaG91cnM6IDIuMCxcclxuICAgICAgICAgICAgICAgIGhvdXI6IDEuMCxcclxuICAgICAgICAgICAgICAgIG1pbnV0ZXM6IDIuMCxcclxuICAgICAgICAgICAgICAgIG1pbnV0ZTogMS4wLFxyXG4gICAgICAgICAgICAgICAgc2Vjb25kczogMi4wLFxyXG4gICAgICAgICAgICAgICAgc2Vjb25kOiAxLjAsXHJcbiAgICAgICAgICAgICAgICBtaWxsaXNlY29uZHM6IDIuMCxcclxuICAgICAgICAgICAgICAgIG1pbGxpc2Vjb25kOiAxLjBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8vIGxhbmd1YWdlIHN1cHBvcnRcclxuICAgICAgICBsYW5ndWFnZXMgOiB7XHJcbiAgICAgICAgICAgICdlbl9VUyc6IHtcclxuXHJcbiAgICAgICAgICAgICAgICBub3c6IFwianVzdCBub3dcIixcclxuXHJcbiAgICAgICAgICAgICAgICBwcmVmaXg6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICBzdWZmaXg6IFwiYWdvXCIsXHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIG1pbGxpc2Vjb25kOiBcIm1pbGxpc2Vjb25kXCIsXHJcbiAgICAgICAgICAgICAgICBtaWxsaXNlY29uZHM6IFwibWlsbGlzZWNvbmRzXCIsXHJcbiAgICAgICAgICAgICAgICBzZWNvbmQ6IFwic2Vjb25kXCIsXHJcbiAgICAgICAgICAgICAgICBzZWNvbmRzOiBcInNlY29uZHNcIixcclxuICAgICAgICAgICAgICAgIG1pbnV0ZTogXCJtaW51dGVcIixcclxuICAgICAgICAgICAgICAgIG1pbnV0ZXM6IFwibWludXRlc1wiLFxyXG4gICAgICAgICAgICAgICAgaG91cjogXCJob3VyXCIsXHJcbiAgICAgICAgICAgICAgICBob3VyczogXCJob3Vyc1wiLFxyXG4gICAgICAgICAgICAgICAgZGF5OiBcImRheVwiLFxyXG4gICAgICAgICAgICAgICAgZGF5czogXCJkYXlzXCIsXHJcbiAgICAgICAgICAgICAgICB3ZWVrOiBcIndlZWtcIixcclxuICAgICAgICAgICAgICAgIHdlZWtzOiBcIndlZWtzXCIsXHJcbiAgICAgICAgICAgICAgICBtb250aDogXCJtb250aFwiLFxyXG4gICAgICAgICAgICAgICAgbW9udGhzOiBcIm1vbnRoc1wiLFxyXG4gICAgICAgICAgICAgICAgeWVhcjogXCJ5ZWFyXCIsXHJcbiAgICAgICAgICAgICAgICB5ZWFyczogXCJ5ZWFyc1wiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBzZXJ2aWNlO1xyXG5cclxuICAgIGZ1bmN0aW9uIGZvcm1hdCAoZGF0ZSwgZnVsbERhdGVPdmVycmlkZSwgdGltZXpvbmUpIHtcclxuICAgICAgICB2YXIgbGRhdGUgPSBzZXJ2aWNlLnBhcnNlRGF0ZShkYXRlKTtcclxuXHJcbiAgICAgICAgLy8gV2Ugd2VyZW4ndCBhYmxlIHRvIHBhcnNlIHRoZSBkYXRlLCBqdXN0IHJldHVybiBhcyBpc1xyXG4gICAgICAgIGlmIChpc05hTihsZGF0ZSkpIHsgcmV0dXJuIGRhdGU7IH1cclxuXHJcbiAgICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgdmFyIGZ1bGxEYXRlLCByZWxhdGl2ZURhdGU7XHJcblxyXG4gICAgICAgIHJlbGF0aXZlRGF0ZSA9IHNlcnZpY2UuZm9ybWF0UmVsYXRpdmUobGRhdGUsIG5vdyk7XHJcblxyXG4gICAgICAgIGlmIChzZXJ2aWNlLmNvbmZpZy5oaWRlRnVsbERhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlbGF0aXZlRGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChmdWxsRGF0ZU92ZXJyaWRlKSB7XHJcbiAgICAgICAgICAgIGZ1bGxEYXRlID0gZnVsbERhdGVPdmVycmlkZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmdWxsRGF0ZSA9IHNlcnZpY2UuZm9ybWF0RnVsbChsZGF0ZSwgbm93LCB0aW1lem9uZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgZm9ybWF0dGVyID0gc2VydmljZS5jb25maWcuY29udGV4dHVhbERhdGVGb3JtYXQ7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IGZvcm1hdHRlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoJyVmdWxsRGF0ZSUnLCBmdWxsRGF0ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKCclcmVsYXRpdmVEYXRlJScsIHJlbGF0aXZlRGF0ZSk7XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZm9ybWF0RnVsbChkYXRlLCBub3csIHRpbWV6b25lKSB7XHJcbiAgICAgICAgdmFyIGxkYXRlID0gc2VydmljZS5wYXJzZURhdGUoZGF0ZSk7XHJcbiAgICAgICAgaWYgKGlzTmFOKGxkYXRlKSkgeyByZXR1cm4gZGF0ZTsgfVxyXG5cclxuICAgICAgICBub3cgPSBub3cgfHwgbmV3IERhdGUoKTtcclxuXHJcbiAgICAgICAgdmFyIGZ1bGxEYXRlID0gXCJcIjtcclxuICAgICAgICB2YXIgdGhyZXNob2xkcyA9IHNlcnZpY2UuY29uZmlnLnRocmVzaG9sZHM7XHJcblxyXG4gICAgICAgIHZhciBpc1RvZGF5ID0gKGxkYXRlLmdldERhdGUoKSA9PT0gbm93LmdldERhdGUoKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGRhdGUuZ2V0TW9udGgoKSA9PT0gbm93LmdldE1vbnRoKCkgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxkYXRlLmdldEZ1bGxZZWFyKCkgPT09IG5vdy5nZXRGdWxsWWVhcigpKTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgdGhpc01vbnRoID0gbmV3IERhdGUobm93LmdldFRpbWUoKSk7XHJcbiAgICAgICAgdGhpc01vbnRoLnNldERhdGUodGhpc01vbnRoLmdldERhdGUoKSAtIE1hdGgucm91bmQodGhyZXNob2xkcy5tb250aCAqIDMxKSk7XHJcbiAgICAgICAgdmFyIGlzVGhpc01vbnRoID0gKGxkYXRlLmdldFRpbWUoKSAtIHRoaXNNb250aC5nZXRUaW1lKCkgPj0gMCk7XHJcblxyXG4gICAgICAgIHZhciB0aGlzWWVhciA9IG5ldyBEYXRlKG5vdy5nZXRUaW1lKCkpO1xyXG4gICAgICAgIHRoaXNZZWFyLnNldERhdGUodGhpc1llYXIuZ2V0RGF0ZSgpIC0gTWF0aC5yb3VuZCh0aHJlc2hvbGRzLnllYXIgKiAzNjUpKTtcclxuICAgICAgICB2YXIgaXNUaGlzWWVhciA9IChsZGF0ZS5nZXRUaW1lKCkgLSB0aGlzWWVhci5nZXRUaW1lKCkgPj0gMCk7XHJcblxyXG4gICAgICAgIHZhciAkZGF0ZUZpbHRlciA9ICRmaWx0ZXIoJ2RhdGUnKTtcclxuICAgICAgICB2YXIgZGF0ZUZvcm1hdHMgPSBzZXJ2aWNlLmNvbmZpZy5mdWxsRGF0ZUZvcm1hdHM7XHJcblxyXG4gICAgICAgIGlmIChpc1RvZGF5KSB7XHJcbiAgICAgICAgICAgIGZ1bGxEYXRlID0gJGRhdGVGaWx0ZXIobGRhdGUsIGRhdGVGb3JtYXRzLnRvZGF5LCB0aW1lem9uZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGlzVGhpc01vbnRoKSB7XHJcbiAgICAgICAgICAgIGZ1bGxEYXRlID0gJGRhdGVGaWx0ZXIobGRhdGUsIGRhdGVGb3JtYXRzLnRoaXNNb250aCwgdGltZXpvbmUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChpc1RoaXNZZWFyKSB7XHJcbiAgICAgICAgICAgIGZ1bGxEYXRlID0gJGRhdGVGaWx0ZXIobGRhdGUsIGRhdGVGb3JtYXRzLnRoaXNZZWFyLCB0aW1lem9uZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBmdWxsRGF0ZSA9ICRkYXRlRmlsdGVyKGxkYXRlLCBkYXRlRm9ybWF0cy5oaXN0b3JpY2FsLCB0aW1lem9uZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZnVsbERhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGFkKGFyZ3MpIHtcclxuICAgICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmpvaW4uY2FsbChhcmd1bWVudHMsIFwiIFwiKS50cmltKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0TGFuZygpIHtcclxuICAgICAgICB2YXIgc2xhbmcgPSBzZXJ2aWNlLmNvbmZpZy5sYW5ndWFnZTtcclxuICAgICAgICB2YXIgZGxhbmcgPSAkZG9jdW1lbnRbMF0uZG9jdW1lbnRFbGVtZW50Lmxhbmc7XHJcbiAgICAgICAgdmFyIGxhbmc7XHJcblxyXG4gICAgICAgIGlmIChzbGFuZykge1xyXG4gICAgICAgICAgICBsYW5nID0gc2VydmljZS5sYW5ndWFnZXNbc2xhbmddO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWxhbmcgJiYgZGxhbmcpIHtcclxuICAgICAgICAgICAgbGFuZyA9IHNlcnZpY2UubGFuZ3VhZ2VzW2RsYW5nXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFsYW5nKSB7XHJcbiAgICAgICAgICAgIGxhbmcgPSBzZXJ2aWNlLmxhbmd1YWdlcy5lbl9VUztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBsYW5nO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGZvcm1hdFJlbGF0aXZlKGRhdGUsIG5vdykge1xyXG4gICAgICAgIHZhciBsZGF0ZSA9IHNlcnZpY2UucGFyc2VEYXRlKGRhdGUpO1xyXG4gICAgICAgIGlmIChpc05hTihsZGF0ZSkpIHsgcmV0dXJuIGRhdGU7IH1cclxuICAgICAgICBub3cgPSBub3cgfHwgbmV3IERhdGUoKTtcclxuXHJcbiAgICAgICAgdmFyIGxhbmcgPSBnZXRMYW5nKCk7XHJcbiAgICAgICAgdmFyIGRpZmYgPSBub3cuZ2V0VGltZSgpIC0gbGRhdGUuZ2V0VGltZSgpO1xyXG5cclxuICAgICAgICB2YXIgbWlsbGlzZWNvbmRzID0gZGlmZjtcclxuICAgICAgICB2YXIgc2Vjb25kcyA9IG1pbGxpc2Vjb25kcyAvIDEwMDA7XHJcbiAgICAgICAgdmFyIG1pbnV0ZXMgPSBzZWNvbmRzIC8gNjA7XHJcbiAgICAgICAgdmFyIGhvdXJzID0gbWludXRlcyAvIDYwO1xyXG4gICAgICAgIHZhciBkYXlzID0gaG91cnMgLyAyNDtcclxuICAgICAgICB2YXIgd2Vla3MgPSBkYXlzIC8gNztcclxuICAgICAgICB2YXIgbW9udGhzID0gZGF5cyAvIDMwO1xyXG4gICAgICAgIHZhciB5ZWFycyA9IGRheXMgLyAzNjU7XHJcblxyXG4gICAgICAgIHZhciByZWxhdGl2ZSA9IFwiXCI7XHJcblxyXG4gICAgICAgIHZhciB0aCA9IHNlcnZpY2UuY29uZmlnLnRocmVzaG9sZHM7XHJcblxyXG4gICAgICAgIGlmICh5ZWFycyA+PSB0aC55ZWFycykge1xyXG4gICAgICAgICAgICByZWxhdGl2ZSA9IHBhZChNYXRoLnJvdW5kKHllYXJzKSwgbGFuZy55ZWFycyk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh5ZWFycyA+PSB0aC55ZWFyKSB7XHJcbiAgICAgICAgICAgIHJlbGF0aXZlID0gcGFkKDEsIGxhbmcueWVhcik7XHJcbiAgICAgICAgfSBlbHNlIGlmIChtb250aHMgPj0gdGgubW9udGhzKSB7XHJcbiAgICAgICAgICAgIHJlbGF0aXZlID0gcGFkKE1hdGgucm91bmQobW9udGhzKSwgbGFuZy5tb250aHMpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobW9udGhzID49IHRoLm1vbnRoKSB7XHJcbiAgICAgICAgICAgIHJlbGF0aXZlID0gcGFkKDEsIGxhbmcubW9udGgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAod2Vla3MgPj0gdGgud2Vla3MpIHtcclxuICAgICAgICAgICAgcmVsYXRpdmUgPSBwYWQoTWF0aC5yb3VuZCh3ZWVrcyksIGxhbmcud2Vla3MpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAod2Vla3MgPj0gdGgud2Vlaykge1xyXG4gICAgICAgICAgICByZWxhdGl2ZSA9IHBhZCgxLCBsYW5nLndlZWspO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZGF5cyA+PSB0aC5kYXlzKSB7XHJcbiAgICAgICAgICAgIHJlbGF0aXZlID0gcGFkKE1hdGgucm91bmQoZGF5cyksIGxhbmcuZGF5cyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkYXlzID49IHRoLmRheSkge1xyXG4gICAgICAgICAgICByZWxhdGl2ZSA9IHBhZCgxLCBsYW5nLmRheSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChob3VycyA+PSB0aC5ob3Vycykge1xyXG4gICAgICAgICAgICByZWxhdGl2ZSA9IHBhZChNYXRoLnJvdW5kKGhvdXJzKSwgbGFuZy5ob3Vycyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChob3VycyA+PSB0aC5ob3VyKSB7XHJcbiAgICAgICAgICAgIHJlbGF0aXZlID0gcGFkKDEsIGxhbmcuaG91cik7XHJcbiAgICAgICAgfSBlbHNlIGlmIChtaW51dGVzID49IHRoLm1pbnV0ZXMpIHtcclxuICAgICAgICAgICAgcmVsYXRpdmUgPSBwYWQoTWF0aC5yb3VuZChtaW51dGVzKSwgbGFuZy5taW51dGVzKTtcclxuICAgICAgICB9IGVsc2UgaWYgKG1pbnV0ZXMgPj0gdGgubWludXRlKSB7XHJcbiAgICAgICAgICAgIHJlbGF0aXZlID0gcGFkKDEsIGxhbmcubWludXRlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNlY29uZHMgPj0gdGguc2Vjb25kcykge1xyXG4gICAgICAgICAgICByZWxhdGl2ZSA9IHBhZChNYXRoLnJvdW5kKHNlY29uZHMpLCBsYW5nLnNlY29uZHMpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2Vjb25kcyA+PSB0aC5zZWNvbmQpIHtcclxuICAgICAgICAgICAgcmVsYXRpdmUgPSBwYWQoMSwgbGFuZy5zZWNvbmQpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobWlsbGlzZWNvbmRzID49IHRoLm1pbGxpc2Vjb25kcykge1xyXG4gICAgICAgICAgICByZWxhdGl2ZSA9IHBhZChNYXRoLnJvdW5kKG1pbGxpc2Vjb25kcyksIGxhbmcubWlsbGlzZWNvbmRzKTtcclxuICAgICAgICB9IGVsc2UgaWYgKG1pbGxpc2Vjb25kcyA+PSB0aC5taWxsaXNlY29uZCkge1xyXG4gICAgICAgICAgICByZWxhdGl2ZSA9IHBhZCgxLCBsYW5nLm1pbGxpc2Vjb25kKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghcmVsYXRpdmUpIHtcclxuICAgICAgICAgICAgcmVsYXRpdmUgPSBsYW5nLm5vdztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZWxhdGl2ZSA9IHBhZChsYW5nLnByZWZpeCwgcmVsYXRpdmUsIGxhbmcuc3VmZml4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZWxhdGl2ZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwYXJzZURhdGUgKGlucHV0KSB7XHJcbiAgICAgICAgaWYgKGlucHV0IGluc3RhbmNlb2YgRGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaW5wdXQ7XHJcbiAgICAgICAgLy8gZGF0ZS5nZXRUaW1lKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChhbmd1bGFyLmlzTnVtYmVyKGlucHV0KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUoaW5wdXQpO1xyXG4gICAgICAgIC8vIGRhdGUuZ2V0VGltZSgpOyBhcyBzdHJpbmdcclxuICAgICAgICB9IGVsc2UgaWYgKC9eXFxkKyQvLnRlc3QoaW5wdXQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZShwYXJzZUludChpbnB1dCwgMTApKTtcclxuICAgICAgICAvLyBJU08gLyBVVENcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUoaW5wdXQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxufSkoKTtcclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9