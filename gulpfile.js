var gulp = require('gulp'); 
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var del = require('del');
var runSequence = require('run-sequence');
var karma = require('karma').Server;
var path = require('path');
var open = require('open');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');

var config = {
  source: ["src/*.module.js", "src/*.js"],
  dest: {
    min: "angular-contextual-date.min.js",
    normal: "angular-contextual-date.js",
    dir: "dist"
  },
  karma: {
    config: "karma.conf.js"
  },
  demo : "demo/index.html"
};


gulp.task('clean', function (done) {
  del(['dist'], done);
});

gulp.task('minify', function () {
  return gulp.src(config.source)
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(concat(config.dest.min))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.dest.dir))
});

gulp.task('maxify', function () {
  return gulp.src(config.source)
    .pipe(sourcemaps.init())
    .pipe(concat(config.dest.normal))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.dest.dir));
});

gulp.task('build', function (done) {
  runSequence('clean', ['minify', 'maxify'], done);
});

gulp.task('test', ['lint'], function (done) {
  new karma({
    configFile: path.join(__dirname, config.karma.config),
    singleRun: true
  }, done).start();
});

gulp.task('demo', function (done) {
  open(path.join(__dirname, config.demo));
});

gulp.task('lint', function (done) {
  return gulp.src(config.source)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'))
    .pipe(jscs());
}); 