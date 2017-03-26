
// Modules for automatization
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
var assets = require('gulp-imagemin');

// task for livereload
gulp.task('connect', () => {
  connect.server({
    root: 'app',
    livereload: true
  });
})

// task for compile files SASS to CSS
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

// function for compile javascript
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

// task for build javascript
gulp.task('build-scripts', () => {
  return compile(true);
})

//task for compile views
gulp.task('views', () => {
  gulp.src('./src/index.pug')
      .pipe(pug())
      .pipe(gulp.dest('./app/'))
      .pipe(connect.reload());
})

gulp.task('assets', () => {
  gulp.src(['src/assets/*.png', 'src/assets/*.jpg'])
  .pipe(assets([
    assets.jpegtran({progressive: true}),
    assets.optipng({optimizationLevel: 5})
  ]))
  .pipe(gulp.dest('./app/assets/'))
})

// task watching static files
gulp.task('watch', () => {

  let pathsFiles = ['./src/**/*.scss','./src/**/*.pug'];
  let tasksFiles = ['sass','views']
  
  let pathsAssets = ['src/assets/*.png', 'src/assets/*.jpg'];
  let taskAssets = ['assets']

  gulp.watch(pathsFiles, tasksFiles);
  gulp.watch(pathsAssets, taskAssets);

});

// task by default 

let taskFinal = [
  'connect', 
  'sass', 
  'views',
  'assets',
  'build-scripts',
  'watch'
  ]
gulp.task('default', taskFinal);