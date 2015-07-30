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
