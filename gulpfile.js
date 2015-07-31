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
var rename = require('gulp-rename');

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
    // combine all source into one file
    .pipe(concat(config.dest.normal))
    // write max version
    .pipe(gulp.dest(config.dest.dir))
    // build and write min version
    .pipe(sourcemaps.init())
    .pipe(uglify())
    // rename the file
    .pipe(rename(config.dest.min))
    // before writing the map (this splits the stream)
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(config.dest.dir))
});


gulp.task('build', function (done) {
  runSequence('clean', ['minify'], done);
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