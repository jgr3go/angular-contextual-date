# contextual-date

Angular directive/filter/service to format a date so it displays a contextual "time ago" relative component in addition to the date. This is useful for things like feeds, emails, comments, etc. to show how recent the timestamp occurred in addition to simplifying the date display to a more relevant format.

* [Examples](#examples)
* [Glossary](#glossary)
* [Usage](#usage)
* [Configuration](#configuration)
* [Language Support](#languages)
* [Contact](#contact)
* [Contributing](#contributing)

<a name="examples"></a>
## Examples

* 11:15 am (7 minutes ago)
* 8:00 am (3 hours ago)
* Jul 25 at 2:38 pm (2 days ago)
* Jul 15 at 10:00 am (1 week ago)
* Mar 30 (4 months ago)
* Jun 14, 2014 (1 year ago)

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
<span>{{ myDate | hsContextualDate }}</span>
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

### Attribute
```html
<div contextual-date ng-attrs-datetime="myDate"></div>
```
Note: While you can technically do this, the Filter or Element methods are recommended, since transclusion isn't turned on for this directive, so if you add this to an element with content already in it it will replace the content. 

### Service
```javascript
angular.controller('appCtrl', function ($scope, contextualDateService)) {
  // Get the contextual date
  var contextualDate = contextualDateService.format($scope.myDate);

  // Get the formatted full date 
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
To configure the service, you can use the following code:  
```javascript
angular.controller('appCtrl', function (contextualDateService) {
  contextualDateService.config.<setting> = <value>;
});
```

The following settings can be configured:

### `config.hideFullDate`  
Default: `false`
```javascript
contextualDateService.config.hideFullDate = true;
```
This will remove the `fullDate` portion of the `contextual-date`. Instead of `11:15 am (7 minutes ago)` it will display as `7 minutes ago`  

### `config.fullDateFormats`  
`fullDateFormats` contains four formats for the `fullDate` component of a `contextual-date`.  They all use the [Angular `date` format](https://docs.angularjs.org/api/ng/filter/date) to generate the result.

#### `fullDateFormats.today`
Default: `"h:mm a"`  
Example: **2:38 pm**  
```javascript
contextualDateService.config.fullDateFormats.today = "h:mm a";
```  
This format will be applied to dates up to one day prior.

#### `fullDateFormats.thisMonth`
Default: `"MMM d 'at' h:mm a"`  
Example: **Jul 23 at 2:38 pm**  
```javascript
contextualDateService.config.fullDateFormats.thisMonth = "MMM d 'at' h:mm a";
```  
This format will be applied to dates one day to one month prior  

#### `fullDateFormats.thisYear`  
Default: `"MMM d"`  
Example: **Jul 15**  
```javascript
contextualDateService.config.fullDateFormats.thisYear = "MMM d";
```  
This format will be applied to dates one month to one year prior  

#### `fullDateFormats.historical`
Default: `"MMM d, y"`  
Example: **Jul 14, 2014**  
```javascript
contextualDateService.config.fullDateFormats.historical = "MMM d, y";
```  
This format will be applied to dates over a year prior 

### `config.contextualDateFormat`
Default: `"%fullDate% (%relativeDate%)"`  
This will set the `format` for the contextual date. It will replace `%fullDate%` and `%relativeDate%` with the `fullDate` and `relativeDate` components respectively. 

### `config.language`
Default: `en_US`  
This will set the language `contextual-date` will use. See [Language Support](#languages) for the current languages supported. 


<a name="languages"></a>
## Language support
Right now, `contextual-date` only supports `en_US`.  It was built to support multiple languages, so pull requests could add support for them.

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

<a name="contact"></a>
## Contact
Contact [Jon Gregorowicz](mailto:jon@helioscene.com) for any questions, or submit a pull request. 

<a name="contributing"></a>
## Contributing
If you want to contribute, we welcome pull requests! Please follow our [contributing guide](CONTRIBUTING.md). 
