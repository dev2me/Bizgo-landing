var gulp = require('gulp');
var sass = require('gulp-sass');
var pug = require('gulp-pug');
var connect = require('gulp-connect');
var cleanCss = require('gulp-clean-css');

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


/*gulp.task('scripts', () => {
  gulp.src('./src/js/index.js')
      .pipe()
});*/

gulp.task('views', () => {
  gulp.src('./src/index.pug')
      .pipe(pug())
      .pipe(gulp.dest('./app/'))
      .pipe(connect.reload());
})

gulp.task('watch', () => {
  gulp.watch(['./src/**/*.scss', './src/**/*.pug'], ['sass', 'views'])
})

gulp.task('default', ['sass', 'views', 'connect','watch']);