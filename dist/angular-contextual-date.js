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

    function formatRelative(date, now) {
        var ldate = service.parseDate(date);
        if (isNaN(ldate)) { return date; }

        now = now || new Date();

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnRleHR1YWwtZGF0ZS5tb2R1bGUuanMiLCJjb250ZXh0dWFsLWRhdGUuZGlyZWN0aXZlLmpzIiwiY29udGV4dHVhbC1kYXRlLmZpbHRlci5qcyIsImNvbnRleHR1YWwtZGF0ZS5zZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYW5ndWxhci1jb250ZXh0dWFsLWRhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gKCkge1xyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnYW5ndWxhci1jb250ZXh0dWFsLWRhdGUnLCBbXSk7XHJcblxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdhbmd1bGFyLWNvbnRleHR1YWwtZGF0ZScpXHJcbiAgICAuZGlyZWN0aXZlKCdjb250ZXh0dWFsRGF0ZScsIGNvbnRleHR1YWxEYXRlRGlyZWN0aXZlKTtcclxuXHJcbmNvbnRleHR1YWxEYXRlRGlyZWN0aXZlLiRpbmplY3QgPSBbXTtcclxuZnVuY3Rpb24gY29udGV4dHVhbERhdGVEaXJlY3RpdmUgKCkge1xyXG4gICAgdmFyIGRpcmVjdGl2ZSA9IHtcclxuICAgICAgICBzY29wZSA6IHtcclxuICAgICAgICAgICAgZGF0ZXRpbWU6IFwiPVwiLFxyXG4gICAgICAgICAgICB0aW1lem9uZTogXCI9XCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlc3RyaWN0OiBcIkVBXCIsXHJcbiAgICAgICAgY29udHJvbGxlcjogQ29udGV4dHVhbERhdGVDb250cm9sbGVyLFxyXG4gICAgICAgIGNvbnRyb2xsZXJBczogXCJDRENcIixcclxuICAgICAgICB0ZW1wbGF0ZTogXCI8c3BhbiBuZy1iaW5kPSdDREMuY0RhdGVGb3JtYXR0ZWQnPjwvc3Bhbj5cIixcclxuICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlXHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbn1cclxuXHJcbkNvbnRleHR1YWxEYXRlQ29udHJvbGxlci4kaW5qZWN0ID0gWydjb250ZXh0dWFsRGF0ZVNlcnZpY2UnXTtcclxuZnVuY3Rpb24gQ29udGV4dHVhbERhdGVDb250cm9sbGVyIChjb250ZXh0dWFsRGF0ZVNlcnZpY2UpIHtcclxuICAgIHZhciB2bSA9IHRoaXM7XHJcblxyXG4gICAgLy8gRGlyZWN0aXZlIHZhcmlhYmxlc1xyXG4gICAgLy8gdm0uZGF0ZXRpbWVcclxuICAgIC8vIHZtLnRpbWV6b25lXHJcblxyXG4gICAgLy8gTG9jYWwgdmFyaWFibGVzXHJcbiAgICB2bS5jRGF0ZUZvcm1hdHRlZCA9IFwiXCI7XHJcblxyXG4gICAgYWN0aXZhdGUoKTtcclxuXHJcbiAgICBmdW5jdGlvbiBhY3RpdmF0ZSAoKSB7XHJcbiAgICAgICAgdm0uY0RhdGVGb3JtYXR0ZWQgPSBjb250ZXh0dWFsRGF0ZVNlcnZpY2UuZm9ybWF0KFxyXG4gICAgICAgICAgICB2bS5kYXRldGltZSxcclxuICAgICAgICAgICAgbnVsbCwgLyogb3ZlcnJpZGVEYXRlICovXHJcbiAgICAgICAgICAgIHZtLnRpbWV6b25lXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufVxyXG5cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnYW5ndWxhci1jb250ZXh0dWFsLWRhdGUnKVxyXG4gICAgLmZpbHRlcignY29udGV4dHVhbERhdGUnLCBjb250ZXh0dWFsRGF0ZUZpbHRlcik7XHJcblxyXG5jb250ZXh0dWFsRGF0ZUZpbHRlci4kaW5qZWN0ID0gWydjb250ZXh0dWFsRGF0ZVNlcnZpY2UnXTtcclxuXHJcbmZ1bmN0aW9uIGNvbnRleHR1YWxEYXRlRmlsdGVyIChjb250ZXh0dWFsRGF0ZVNlcnZpY2UpIHtcclxuICAgIHJldHVybiBmaWx0ZXI7XHJcblxyXG4gICAgZnVuY3Rpb24gZmlsdGVyICh2YWx1ZSwgdGltZXpvbmUpIHtcclxuICAgICAgICByZXR1cm4gY29udGV4dHVhbERhdGVTZXJ2aWNlLmZvcm1hdCh2YWx1ZSwgbnVsbCwgdGltZXpvbmUpO1xyXG4gICAgfVxyXG59XHJcblxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdhbmd1bGFyLWNvbnRleHR1YWwtZGF0ZScpXHJcbiAgICAuZmFjdG9yeSgnY29udGV4dHVhbERhdGVTZXJ2aWNlJywgY29udGV4dHVhbERhdGVTZXJ2aWNlKTtcclxuXHJcbmNvbnRleHR1YWxEYXRlU2VydmljZS4kaW5qZWN0ID0gW1wiJGZpbHRlclwiLCBcIiRkb2N1bWVudFwiXTtcclxuXHJcbmZ1bmN0aW9uIGNvbnRleHR1YWxEYXRlU2VydmljZSAoJGZpbHRlciwgJGRvY3VtZW50KSB7XHJcbiAgICB2YXIgc2VydmljZSA9IHtcclxuICAgICAgICAvLyBmdW5jdGlvbnNcclxuICAgICAgICBmb3JtYXQ6IGZvcm1hdCxcclxuICAgICAgICBmb3JtYXRSZWxhdGl2ZTogZm9ybWF0UmVsYXRpdmUsXHJcbiAgICAgICAgZm9ybWF0RnVsbDogZm9ybWF0RnVsbCxcclxuICAgICAgICBwYXJzZURhdGU6IHBhcnNlRGF0ZSxcclxuXHJcbiAgICAgICAgLy8gY29uZmlndXJhdGlvbnNcclxuICAgICAgICBjb25maWc6IHtcclxuICAgICAgICAgICAgaGlkZUZ1bGxEYXRlIDogZmFsc2UsXHJcblxyXG4gICAgICAgICAgICBmdWxsRGF0ZUZvcm1hdHMgOiB7XHJcbiAgICAgICAgICAgICAgICB0b2RheTogXCJoOm1tIGFcIixcclxuICAgICAgICAgICAgICAgIHRoaXNNb250aDogXCJNTU0gZCAnYXQnIGg6bW0gYVwiLFxyXG4gICAgICAgICAgICAgICAgdGhpc1llYXI6IFwiTU1NIGRcIixcclxuICAgICAgICAgICAgICAgIGhpc3RvcmljYWw6IFwiTU1NIGQsIHlcIlxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgY29udGV4dHVhbERhdGVGb3JtYXQ6IFwiJWZ1bGxEYXRlJSAoJXJlbGF0aXZlRGF0ZSUpXCIsXHJcblxyXG4gICAgICAgICAgICBsYW5ndWFnZTogbnVsbCwgLy8gdGhpcyB3aWxsIGhhcmQgc2V0IHRoZSBsYW5ndWFnZVxyXG5cclxuICAgICAgICAgICAgdGhyZXNob2xkczoge1xyXG4gICAgICAgICAgICAgICAgeWVhcnM6IDEuNzUsXHJcbiAgICAgICAgICAgICAgICB5ZWFyOiAwLjc1LFxyXG4gICAgICAgICAgICAgICAgbW9udGhzOiAxLjc1LFxyXG4gICAgICAgICAgICAgICAgbW9udGg6IDAuOSxcclxuICAgICAgICAgICAgICAgIHdlZWtzOiAxLjc1LFxyXG4gICAgICAgICAgICAgICAgd2VlazogMS4wLFxyXG4gICAgICAgICAgICAgICAgZGF5czogMi4wLFxyXG4gICAgICAgICAgICAgICAgZGF5OiAxLjAsXHJcbiAgICAgICAgICAgICAgICBob3VyczogMi4wLFxyXG4gICAgICAgICAgICAgICAgaG91cjogMS4wLFxyXG4gICAgICAgICAgICAgICAgbWludXRlczogMi4wLFxyXG4gICAgICAgICAgICAgICAgbWludXRlOiAxLjAsXHJcbiAgICAgICAgICAgICAgICBzZWNvbmRzOiAyLjAsXHJcbiAgICAgICAgICAgICAgICBzZWNvbmQ6IDEuMCxcclxuICAgICAgICAgICAgICAgIG1pbGxpc2Vjb25kczogMi4wLFxyXG4gICAgICAgICAgICAgICAgbWlsbGlzZWNvbmQ6IDEuMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLy8gbGFuZ3VhZ2Ugc3VwcG9ydFxyXG4gICAgICAgIGxhbmd1YWdlcyA6IHtcclxuICAgICAgICAgICAgJ2VuX1VTJzoge1xyXG5cclxuICAgICAgICAgICAgICAgIG5vdzogXCJqdXN0IG5vd1wiLFxyXG5cclxuICAgICAgICAgICAgICAgIHByZWZpeDogXCJcIixcclxuICAgICAgICAgICAgICAgIHN1ZmZpeDogXCJhZ29cIixcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgbWlsbGlzZWNvbmQ6IFwibWlsbGlzZWNvbmRcIixcclxuICAgICAgICAgICAgICAgIG1pbGxpc2Vjb25kczogXCJtaWxsaXNlY29uZHNcIixcclxuICAgICAgICAgICAgICAgIHNlY29uZDogXCJzZWNvbmRcIixcclxuICAgICAgICAgICAgICAgIHNlY29uZHM6IFwic2Vjb25kc1wiLFxyXG4gICAgICAgICAgICAgICAgbWludXRlOiBcIm1pbnV0ZVwiLFxyXG4gICAgICAgICAgICAgICAgbWludXRlczogXCJtaW51dGVzXCIsXHJcbiAgICAgICAgICAgICAgICBob3VyOiBcImhvdXJcIixcclxuICAgICAgICAgICAgICAgIGhvdXJzOiBcImhvdXJzXCIsXHJcbiAgICAgICAgICAgICAgICBkYXk6IFwiZGF5XCIsXHJcbiAgICAgICAgICAgICAgICBkYXlzOiBcImRheXNcIixcclxuICAgICAgICAgICAgICAgIHdlZWs6IFwid2Vla1wiLFxyXG4gICAgICAgICAgICAgICAgd2Vla3M6IFwid2Vla3NcIixcclxuICAgICAgICAgICAgICAgIG1vbnRoOiBcIm1vbnRoXCIsXHJcbiAgICAgICAgICAgICAgICBtb250aHM6IFwibW9udGhzXCIsXHJcbiAgICAgICAgICAgICAgICB5ZWFyOiBcInllYXJcIixcclxuICAgICAgICAgICAgICAgIHllYXJzOiBcInllYXJzXCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHNlcnZpY2U7XHJcblxyXG4gICAgZnVuY3Rpb24gZm9ybWF0IChkYXRlLCBmdWxsRGF0ZU92ZXJyaWRlLCB0aW1lem9uZSkge1xyXG4gICAgICAgIHZhciBsZGF0ZSA9IHNlcnZpY2UucGFyc2VEYXRlKGRhdGUpO1xyXG5cclxuICAgICAgICAvLyBXZSB3ZXJlbid0IGFibGUgdG8gcGFyc2UgdGhlIGRhdGUsIGp1c3QgcmV0dXJuIGFzIGlzXHJcbiAgICAgICAgaWYgKGlzTmFOKGxkYXRlKSkgeyByZXR1cm4gZGF0ZTsgfVxyXG5cclxuICAgICAgICB2YXIgbm93ID0gbmV3IERhdGUoKTtcclxuICAgICAgICB2YXIgZnVsbERhdGUsIHJlbGF0aXZlRGF0ZTtcclxuXHJcbiAgICAgICAgcmVsYXRpdmVEYXRlID0gc2VydmljZS5mb3JtYXRSZWxhdGl2ZShsZGF0ZSwgbm93KTtcclxuXHJcbiAgICAgICAgaWYgKHNlcnZpY2UuY29uZmlnLmhpZGVGdWxsRGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVsYXRpdmVEYXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGZ1bGxEYXRlT3ZlcnJpZGUpIHtcclxuICAgICAgICAgICAgZnVsbERhdGUgPSBmdWxsRGF0ZU92ZXJyaWRlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZ1bGxEYXRlID0gc2VydmljZS5mb3JtYXRGdWxsKGxkYXRlLCBub3csIHRpbWV6b25lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBmb3JtYXR0ZXIgPSBzZXJ2aWNlLmNvbmZpZy5jb250ZXh0dWFsRGF0ZUZvcm1hdDtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gZm9ybWF0dGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgnJWZ1bGxEYXRlJScsIGZ1bGxEYXRlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoJyVyZWxhdGl2ZURhdGUlJywgcmVsYXRpdmVEYXRlKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBmb3JtYXRGdWxsKGRhdGUsIG5vdywgdGltZXpvbmUpIHtcclxuICAgICAgICB2YXIgbGRhdGUgPSBzZXJ2aWNlLnBhcnNlRGF0ZShkYXRlKTtcclxuICAgICAgICBpZiAoaXNOYU4obGRhdGUpKSB7IHJldHVybiBkYXRlOyB9XHJcblxyXG4gICAgICAgIG5vdyA9IG5vdyB8fCBuZXcgRGF0ZSgpO1xyXG5cclxuICAgICAgICB2YXIgZnVsbERhdGUgPSBcIlwiO1xyXG4gICAgICAgIHZhciB0aHJlc2hvbGRzID0gc2VydmljZS5jb25maWcudGhyZXNob2xkcztcclxuXHJcbiAgICAgICAgdmFyIGlzVG9kYXkgPSAobGRhdGUuZ2V0RGF0ZSgpID09PSBub3cuZ2V0RGF0ZSgpICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZGF0ZS5nZXRNb250aCgpID09PSBub3cuZ2V0TW9udGgoKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGRhdGUuZ2V0RnVsbFllYXIoKSA9PT0gbm93LmdldEZ1bGxZZWFyKCkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciB0aGlzTW9udGggPSBuZXcgRGF0ZShub3cuZ2V0VGltZSgpKTtcclxuICAgICAgICB0aGlzTW9udGguc2V0RGF0ZSh0aGlzTW9udGguZ2V0RGF0ZSgpIC0gTWF0aC5yb3VuZCh0aHJlc2hvbGRzLm1vbnRoICogMzEpKTtcclxuICAgICAgICB2YXIgaXNUaGlzTW9udGggPSAobGRhdGUuZ2V0VGltZSgpIC0gdGhpc01vbnRoLmdldFRpbWUoKSA+PSAwKTtcclxuXHJcbiAgICAgICAgdmFyIHRoaXNZZWFyID0gbmV3IERhdGUobm93LmdldFRpbWUoKSk7XHJcbiAgICAgICAgdGhpc1llYXIuc2V0RGF0ZSh0aGlzWWVhci5nZXREYXRlKCkgLSBNYXRoLnJvdW5kKHRocmVzaG9sZHMueWVhciAqIDM2NSkpO1xyXG4gICAgICAgIHZhciBpc1RoaXNZZWFyID0gKGxkYXRlLmdldFRpbWUoKSAtIHRoaXNZZWFyLmdldFRpbWUoKSA+PSAwKTtcclxuXHJcbiAgICAgICAgdmFyICRkYXRlRmlsdGVyID0gJGZpbHRlcignZGF0ZScpO1xyXG4gICAgICAgIHZhciBkYXRlRm9ybWF0cyA9IHNlcnZpY2UuY29uZmlnLmZ1bGxEYXRlRm9ybWF0cztcclxuXHJcbiAgICAgICAgaWYgKGlzVG9kYXkpIHtcclxuICAgICAgICAgICAgZnVsbERhdGUgPSAkZGF0ZUZpbHRlcihsZGF0ZSwgZGF0ZUZvcm1hdHMudG9kYXksIHRpbWV6b25lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoaXNUaGlzTW9udGgpIHtcclxuICAgICAgICAgICAgZnVsbERhdGUgPSAkZGF0ZUZpbHRlcihsZGF0ZSwgZGF0ZUZvcm1hdHMudGhpc01vbnRoLCB0aW1lem9uZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGlzVGhpc1llYXIpIHtcclxuICAgICAgICAgICAgZnVsbERhdGUgPSAkZGF0ZUZpbHRlcihsZGF0ZSwgZGF0ZUZvcm1hdHMudGhpc1llYXIsIHRpbWV6b25lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGZ1bGxEYXRlID0gJGRhdGVGaWx0ZXIobGRhdGUsIGRhdGVGb3JtYXRzLmhpc3RvcmljYWwsIHRpbWV6b25lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmdWxsRGF0ZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwYWQoYXJncykge1xyXG4gICAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuam9pbi5jYWxsKGFyZ3VtZW50cywgXCIgXCIpLnRyaW0oKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBmb3JtYXRSZWxhdGl2ZShkYXRlLCBub3cpIHtcclxuICAgICAgICB2YXIgbGRhdGUgPSBzZXJ2aWNlLnBhcnNlRGF0ZShkYXRlKTtcclxuICAgICAgICBpZiAoaXNOYU4obGRhdGUpKSB7IHJldHVybiBkYXRlOyB9XHJcblxyXG4gICAgICAgIG5vdyA9IG5vdyB8fCBuZXcgRGF0ZSgpO1xyXG5cclxuICAgICAgICB2YXIgc2xhbmcgPSBzZXJ2aWNlLmNvbmZpZy5sYW5ndWFnZTtcclxuICAgICAgICB2YXIgZGxhbmcgPSAkZG9jdW1lbnRbMF0uZG9jdW1lbnRFbGVtZW50Lmxhbmc7XHJcbiAgICAgICAgdmFyIGxhbmc7XHJcblxyXG4gICAgICAgIGlmIChzbGFuZykge1xyXG4gICAgICAgICAgICBsYW5nID0gc2VydmljZS5sYW5ndWFnZXNbc2xhbmddO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWxhbmcgJiYgZGxhbmcpIHtcclxuICAgICAgICAgICAgbGFuZyA9IHNlcnZpY2UubGFuZ3VhZ2VzW2RsYW5nXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFsYW5nKSB7XHJcbiAgICAgICAgICAgIGxhbmcgPSBzZXJ2aWNlLmxhbmd1YWdlcy5lbl9VUztcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGRpZmYgPSBub3cuZ2V0VGltZSgpIC0gbGRhdGUuZ2V0VGltZSgpO1xyXG5cclxuICAgICAgICB2YXIgbWlsbGlzZWNvbmRzID0gZGlmZjtcclxuICAgICAgICB2YXIgc2Vjb25kcyA9IG1pbGxpc2Vjb25kcyAvIDEwMDA7XHJcbiAgICAgICAgdmFyIG1pbnV0ZXMgPSBzZWNvbmRzIC8gNjA7XHJcbiAgICAgICAgdmFyIGhvdXJzID0gbWludXRlcyAvIDYwO1xyXG4gICAgICAgIHZhciBkYXlzID0gaG91cnMgLyAyNDtcclxuICAgICAgICB2YXIgd2Vla3MgPSBkYXlzIC8gNztcclxuICAgICAgICB2YXIgbW9udGhzID0gZGF5cyAvIDMwO1xyXG4gICAgICAgIHZhciB5ZWFycyA9IGRheXMgLyAzNjU7XHJcblxyXG4gICAgICAgIHZhciByZWxhdGl2ZSA9IFwiXCI7XHJcblxyXG4gICAgICAgIHZhciB0aCA9IHNlcnZpY2UuY29uZmlnLnRocmVzaG9sZHM7XHJcblxyXG4gICAgICAgIGlmICh5ZWFycyA+PSB0aC55ZWFycykge1xyXG4gICAgICAgICAgICByZWxhdGl2ZSA9IHBhZChNYXRoLnJvdW5kKHllYXJzKSwgbGFuZy55ZWFycyk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh5ZWFycyA+PSB0aC55ZWFyKSB7XHJcbiAgICAgICAgICAgIHJlbGF0aXZlID0gcGFkKDEsIGxhbmcueWVhcik7XHJcbiAgICAgICAgfSBlbHNlIGlmIChtb250aHMgPj0gdGgubW9udGhzKSB7XHJcbiAgICAgICAgICAgIHJlbGF0aXZlID0gcGFkKE1hdGgucm91bmQobW9udGhzKSwgbGFuZy5tb250aHMpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobW9udGhzID49IHRoLm1vbnRoKSB7XHJcbiAgICAgICAgICAgIHJlbGF0aXZlID0gcGFkKDEsIGxhbmcubW9udGgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAod2Vla3MgPj0gdGgud2Vla3MpIHtcclxuICAgICAgICAgICAgcmVsYXRpdmUgPSBwYWQoTWF0aC5yb3VuZCh3ZWVrcyksIGxhbmcud2Vla3MpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAod2Vla3MgPj0gdGgud2Vlaykge1xyXG4gICAgICAgICAgICByZWxhdGl2ZSA9IHBhZCgxLCBsYW5nLndlZWspO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZGF5cyA+PSB0aC5kYXlzKSB7XHJcbiAgICAgICAgICAgIHJlbGF0aXZlID0gcGFkKE1hdGgucm91bmQoZGF5cyksIGxhbmcuZGF5cyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkYXlzID49IHRoLmRheSkge1xyXG4gICAgICAgICAgICByZWxhdGl2ZSA9IHBhZCgxLCBsYW5nLmRheSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChob3VycyA+PSB0aC5ob3Vycykge1xyXG4gICAgICAgICAgICByZWxhdGl2ZSA9IHBhZChNYXRoLnJvdW5kKGhvdXJzKSwgbGFuZy5ob3Vycyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChob3VycyA+PSB0aC5ob3VyKSB7XHJcbiAgICAgICAgICAgIHJlbGF0aXZlID0gcGFkKDEsIGxhbmcuaG91cik7XHJcbiAgICAgICAgfSBlbHNlIGlmIChtaW51dGVzID49IHRoLm1pbnV0ZXMpIHtcclxuICAgICAgICAgICAgcmVsYXRpdmUgPSBwYWQoTWF0aC5yb3VuZChtaW51dGVzKSwgbGFuZy5taW51dGVzKTtcclxuICAgICAgICB9IGVsc2UgaWYgKG1pbnV0ZXMgPj0gdGgubWludXRlKSB7XHJcbiAgICAgICAgICAgIHJlbGF0aXZlID0gcGFkKDEsIGxhbmcubWludXRlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNlY29uZHMgPj0gdGguc2Vjb25kcykge1xyXG4gICAgICAgICAgICByZWxhdGl2ZSA9IHBhZChNYXRoLnJvdW5kKHNlY29uZHMpLCBsYW5nLnNlY29uZHMpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2Vjb25kcyA+PSB0aC5zZWNvbmQpIHtcclxuICAgICAgICAgICAgcmVsYXRpdmUgPSBwYWQoMSwgbGFuZy5zZWNvbmQpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobWlsbGlzZWNvbmRzID49IHRoLm1pbGxpc2Vjb25kcykge1xyXG4gICAgICAgICAgICByZWxhdGl2ZSA9IHBhZChNYXRoLnJvdW5kKG1pbGxpc2Vjb25kcyksIGxhbmcubWlsbGlzZWNvbmRzKTtcclxuICAgICAgICB9IGVsc2UgaWYgKG1pbGxpc2Vjb25kcyA+PSB0aC5taWxsaXNlY29uZCkge1xyXG4gICAgICAgICAgICByZWxhdGl2ZSA9IHBhZCgxLCBsYW5nLm1pbGxpc2Vjb25kKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghcmVsYXRpdmUpIHtcclxuICAgICAgICAgICAgcmVsYXRpdmUgPSBsYW5nLm5vdztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZWxhdGl2ZSA9IHBhZChsYW5nLnByZWZpeCwgcmVsYXRpdmUsIGxhbmcuc3VmZml4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZWxhdGl2ZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwYXJzZURhdGUgKGlucHV0KSB7XHJcbiAgICAgICAgaWYgKGlucHV0IGluc3RhbmNlb2YgRGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaW5wdXQ7XHJcbiAgICAgICAgLy8gZGF0ZS5nZXRUaW1lKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChhbmd1bGFyLmlzTnVtYmVyKGlucHV0KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUoaW5wdXQpO1xyXG4gICAgICAgIC8vIGRhdGUuZ2V0VGltZSgpOyBhcyBzdHJpbmdcclxuICAgICAgICB9IGVsc2UgaWYgKC9eXFxkKyQvLnRlc3QoaW5wdXQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZShwYXJzZUludChpbnB1dCwgMTApKTtcclxuICAgICAgICAvLyBJU08gLyBVVENcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUoaW5wdXQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxufSkoKTtcclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9