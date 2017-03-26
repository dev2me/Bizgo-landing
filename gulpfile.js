var gulp = require('gulp');
var sass = require('gulp-sass');
var pug = require('gulp-pug');
var connect = require('gulp-connect');
var cleanCss = require('gulp-clean-css');
var browserify = require('browserify');
var babel = require('babelify')
var preset = require('babel-preset-es2015');
var source = require('vinyl-source-stream');
var watchify = require("watchify");
var rename = require('gulp-rename');
gulp.task('connect', () => {
  connect.server({
    root: 'app',
    livereload: true
  });
})

gulp.task('sass', () => {
    gulp.src('./src/sass/index.scss')
        .pipe(sass({includePaths: ["node_modules"]}).on('error', sass.logError))
        .pipe(cleanCss({debug: true}, (details) => {
          console.log(details.name + ': ' + details.stats.originalSize);
          console.log(details.name + ': ' + details.stats.minifiedSize);
        }))
        .pipe(gulp.dest('./app/css/'))
        .pipe(connect.reload());
});


function compile(watch) {
  var bundle = watchify(browserify("./src/js/index.js", {debug: true}));

  function rebundle() {
    bundle
    .transform(babel, preset)
    .bundle()
    .on('error', (er) => {
      console.log(er);
      this.emit('end');
    })
    .pipe(source('index.js'))
    .pipe(rename('build.js'))
    .pipe(gulp.dest('./app/js'))
  }

  if(watch) {
    bundle.on('update', () => {
      console.log('Building...');
      rebundle();
    })
  }
  rebundle();
}

gulp.task('build-scripts', () => {
  return compile(true);
})
gulp.task('views', () => {
  gulp.src('./src/index.pug')
      .pipe(pug())
      .pipe(gulp.dest('./app/'))
      .pipe(connect.reload());
})

gulp.task('watch', () => {
  gulp.watch(['./src/**/*.scss', './src/**/*.pug'], ['sass', 'views'])
})

gulp.task('default', ['sass', 'views', 'connect', 'build-scripts','watch']);