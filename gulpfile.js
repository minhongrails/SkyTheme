var gulp = require('gulp');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var cp = require('child_process');
var replace = require('gulp-regex-replace');
var rename = require("gulp-rename");

var messages = {
  jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build',
  jekyllClean: '<span style="color: grey">Running:</span> $ jekyll clean'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
  browserSync.notify(messages.jekyllBuild);
  return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
    .on('close', done);
});

/**
 * Clean the Jekyll Site
 */
gulp.task('jekyll-clean', function (done) {
  browserSync.notify(messages.jekyllClean);
  return cp.spawn('jekyll', ['clean'], {stdio: 'inherit'})
    .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
  browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-build'], function () {
  browserSync({
    server: {
      baseDir: '_site'
    }
  });
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
  return gulp.src('./_scss/**/*.scss')
    .pipe(sass())
    .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
    .pipe(gulp.dest('_site/css'))
    .pipe(browserSync.reload({stream: true}))
    .pipe(gulp.dest('css'));
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
  gulp.watch('_scss/**/*.scss', ['sass']);
  gulp.watch(['*.html', '_layouts/*.html', '_includes/*.html', '_posts/*'], ['jekyll-rebuild']);
});


gulp.task('replace', function () {
  gulp.src('_posts/**/*')
    .pipe(replace({
      regex: '<div class="mSpotlight">(.*)</div>',
      replace: '<h1>$1</h1>'
    }))
    .pipe(gulp.dest('_posts'));
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);
gulp.task('clean', ['jekyll-clean']);
