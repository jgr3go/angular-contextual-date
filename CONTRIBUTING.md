# How to contribute

Please feel free to contribute! We'd love this project to be more useful. 

## Setup Instructions
1. Fork and clone the repo
  ```
  $> git clone git@github.com:your-username/angular-contextual-date.git
  ```

2. Make sure you have all the dependencies installed.  We assume you have [npm](https://www.npmjs.com/) and [bower](https://www.npmjs.com/package/bower) already installed globally.
  ```
  $> npm install
  ```
  There is a postinstall script to also run `bower install`

3. We use [grunt](https://www.npmjs.com/package/grunt) as a taskrunner to build/test the library.  We suggest you install it globally, but if you prefer not to you can get around it. 
  ```
  $> npm install -g grunt
  ```

## Code Style
We use [John Papa's Angular Styleguide](https://github.com/johnpapa/angular-styleguide) to modularize, write, and test our code.  We ask that you do the same. 

## Pre-Pull Request
1. Write tests!  See examples in the [tests](/tests) directory. 

2. Make sure all tests pass:
  ```
  $> gulp test
  ```
  This will not only run the tests, but create a `coverage/` subdirectory with an html file that displays how much coverage this library has. We will be looking at this before accepting a pull request. 

3. Build the library
  ```
  $> gulp build
  ```
  This generates the `dist/` directory with `angular-contextual-date.js` and `angular-contextual-date.min.js`

## Pull Request
Submit us a pull request!
