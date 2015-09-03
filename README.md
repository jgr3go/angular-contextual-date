# contextual-date

A lightweight Angular directive/filter/service to format a date so it displays a contextual relative time ("how long ago") in addition to the date. This is useful for things like feeds, emails, comments, etc. to show how recent the timestamp occurred in addition to simplifying the date display to a more relevant format.

At it's simplest, it can be used out of the box as a filter: `<span>{{ someDate | contextualDate }}</span>`, but it's highly configurable via a service which is what the rest of this document describes. 

* [Goals](#goals)
* [Examples/Demo](#examples)
* [Glossary](#glossary)
* [Usage](#usage)
* [Configuration](#configuration)
* [Language Support](#languages)
* [Contact](#contact)
* [Contributing](#contributing)

<a name="goals"></a>
## Goals
The goals of this module are twofold:  

1. We did not want to use `am-time-ago` in [moment.js](http://momentjs.com) because while the library is great, we *really* didn't want to have to load all of [moment.min.js](https://github.com/moment/moment/blob/develop/min/moment.min.js) (35.5K) as well as [angular-moment.min.js](https://github.com/urish/angular-moment/blob/master/angular-moment.min.js) (4.5K) purely for this functionality.  So we built a 3.5K library that does mostly the same thing, we think a little bit better.  

2. We also didn't want to have to repeat the same format filter for every single date we were displaying across a site. We love DRY principles, so `angular-contextual-date` uses a service to allow configurations that will apply across the board for certain scenarios (e.g. one format for today, a different one for the last month), and then if you really need to change it you can always tweak the format on individual dates. 

<a name="examples"></a>
## Examples
`contextual-date` changes the display format depending on how far away the date is relative to now. The formats are configurable, but the defaults should be good for most use-cases.

##### Past
* 11:15 am (7 minutes ago)
* 8:00 am (3 hours ago)
* Jul 25 at 2:38 pm (2 days ago)
* Jul 15 at 10:00 am (1 week ago)
* Mar 30 (4 months ago)
* Jun 14, 2014 (1 year ago)

##### Future
* Jul 29 at 9:05 am (2 days from now)
* Jul 29, 2016 (1 year from now)

## Demo
See a working demo here: http://helioscene.github.io/angular-contextual-date/

<a name="glossary"></a>
## Glossary  

|Term|Meaning|
|:---|:---|
|`contextual-date`|The full display of a resulting date. e.g. **Jul 25 at 2:38 pm (2 days ago)** |
|`fullDate`|The component of a `contextual-date` that displays the real date. e.g. **Jul 25 at 2:38 pm**|
|`relativeDate`|The component of a `contextual-date` that displays the relative time. e.g. **2 days ago**|

<a name="usage"></a>
## Usage

`contextual-date` can be used as a filter or an element. The service can also be directly called if you want to use the results yourself, though normally you probably won't need to. 

### Filter
```html 
<span>{{ myDate | contextualDate }}</span>
```  

### Element 
```html
<contextual-date datetime="myDate"></contextual-date>
```

The element also takes in a `full-date-override` property if you want to override the `fullDate` component with your own string. 
```html 
<contextual-date datetime="myDate" full-date-override="myFormattedDate"></contextual-date>
```
See the Service's [fullDateOverride](#fullDateOverride) section


### Service
You can also call the service directly if you want to do something else with the results
```javascript
angular.controller('appCtrl', function ($scope, contextualDateService)) {
  // Get the contextual date
  var contextualDate = contextualDateService.format($scope.myDate);

  // Get the filtered full date 
  var fullDate = contextualDateService.formatFull($scope.myDate);

  // Get the relative date
  var relativeDate = contextualDateService.formatRelative($scope.myDate);
}
```

<a name="fullDateOverride"></a>
#### `fullDateOverride`
The service also allows you to pass in a `fullDateOverride` if you've formatted the full date on your end and want to override all `fullDate` formatting `contextual-date` will do. 

Instead of:
```javascript
contextualDateService.format($scope.myDate);
// Jun 24 at 2:38 pm (7 minutes ago)
```
you can pass in your own override  
```javascript
contextualDateService.format($scope.myDate, "Mah date!!");
// Mah date!! (7 minutes ago)
```

<a name="configuration"></a>
## Configuration
To configure the service, access the `.config` settings of the service in code:  
```javascript
angular.controller('appCtrl', function (contextualDateService) {
  contextualDateService.config.<setting> = <value>;
});
```

The following settings can be configured:

### `config.hideFullDate`  
Default: `false`  
When this is true, it will remove the `fullDate` portion of the `contextual-date` and only show the `relativeDate`. Instead of `11:15 am (7 minutes ago)` it will display as `7 minutes ago`.

### `config.fullDateFormats`  
`fullDateFormats` contains several formats for the `fullDate` component of a `contextual-date`.  They all use the [Angular `date` format](https://docs.angularjs.org/api/ng/filter/date) to generate the result.

```javascript
contextualDateService.config.fullDateFormats.<option> = <format>;
```

|Option|Description|
|:--|:--|
|`today`|<span>Applied to dates with the same year, month, and date<br/>Default: `"h:mm a"`<br/>Example: **2:38 pm**</span>|
|`thisMonth`|<span>Applied to dates from one day to ~one month prior<br/>Default: `"MMM d 'at' h:mm a"`<br/>Example: **Jul 23 at 2:38 pm**</span>|
|`thisYear`|<span>Applied to dates from ~one month to ~one year prior<br/>Default: `"MMM d"`<br/>Example: **Jul 14**</span>|
|`historical`|<span>Applied to dates over one year prior<br/>Default: `"MMM d, y"`<br/>Example: **Jul 14, 2014**</span>|
|`nextMonth`|<span>Applied to dates from one day to ~one month in the future<br/>Default: `"MMM d 'at' h:mm a"`<br/>Example: **Jul 23 at 2:38 pm**</span>|
|`nextYear`|<span>Applied to dates from ~one month to ~one year in the future<br/>Default: `"MMM d, y"`<br/>Example: **Jul 23, 2016**</span>|
|`future`|<span>Applied to dates over one year in the future<br/>Default: `"MMM d, y"`<br/>Example: **Jul 23, 2017**</span>|


### `config.contextualDateFormat`
Default: `"%fullDate% (%relativeDate%)"`  
This describes the display format for the full `contextual-date`. It will replace `%fullDate%` and `%relativeDate%` with the `fullDate` and `relativeDate` components respectively. 

### `config.language`
Default: `en_US`  
This sets the language `contextual-date` will use. See [Language Support](#languages) for the current languages supported. 

<a name="languages"></a>
## Language support
Right now, `contextual-date` only supports `en_US`.  It was built to easily support multiple languages, so pull requests or a discussion could add support for them very quickly -- see the [contextual-date.service.js](src/contextual-date.service.js) `language support` section for what's required.

There are two ways it attempts to detect the language:  
* Priority 1: service configuration 
```javascript
contextualDateService.config.language = 'en_US';
```

* Priority 2: html document property
```html
<html lang='en_US'>
...
```

* Default: `en_US`

<a name="languages-override"></a>
#### Language overrides
You can override specific language settings at load/runtime by modifying the values. The most typical case for this will be if you want a different prefix/suffix on the `relativeDate`. These values are configured by the `prefix`, `suffix`, `futurePrefix`, and `futureSuffix` properties of each language. 

For example, the default future date format is: `Jul 23 (5 days from now)`
where `futurePrefix == ""` and `futureSuffix == "from now"`.  

However, if you wanted this to display as `Jul 23 (in 5 days)`, you could set:
```javascript
contextualDateService.languages["en_US"].futurePrefix = "in";
contextualDateService.languages["en_US"].futureSuffix = "";
```
and this would have the desired effect.  

<a name="contact"></a>
## Contact
Contact [Jon Gregorowicz](mailto:jon@helioscene.com) for any questions, or submit a pull request. 

<a name="contributing"></a>
## Contributing
If you want to contribute, we welcome pull requests! Please follow our [contributing guide](CONTRIBUTING.md). 
