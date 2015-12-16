// dependencies ...
var gulp        = require('gulp')
  , runSequence = require('run-sequence')
  , liveserver  = require('gulp-live-server')
  , vulcanize   = require('gulp-vulcanize')
  , crisper     = require('gulp-crisper')
  , babel       = require('gulp-babel')
  , eslint      = require('gulp-eslint')
  , del         = require('del');

require('web-component-tester').gulp.init(gulp);

// reference to the local dev server ...
var server;

// basic clean task which blows out the entire /dist directory ...
gulp.task('clean', function () {
    return del(['./dist/**/*']);
});

// initial lib copy task to /dist directory ...
gulp.task('libs', function(callback) {
    return gulp.src([
        './bower_components/webcomponentsjs/webcomponents-lite.js',
        './bower_components/jquery/dist/jquery.min.js'
    ])
    .pipe(gulp.dest('./dist/libs'));
});

// general copy task, copies example index.html to /dist directory ...
gulp.task('copy', function(callback) {
    gulp.src('./src/index.html').pipe(gulp.dest('./dist'))
    return gulp.src(['./src/assets/*.png', './src/assets/*.gif'])
        .pipe(gulp.dest('./dist/assets'))
});

// executes eslint against all ES6 sources ...
gulp.task('eslint', function(callback) {
    return gulp.src([
        'src/elements/**/*.js',
    ])
    .pipe(eslint())
    .pipe(eslint.format());
});

// transpiles ES6 sources down to ES5 ...
gulp.task('babel', function(callback){
    return gulp.src(['./dist/elements.js'])
        .pipe(babel())
        .pipe(gulp.dest('./dist/'))
});

// vulcanizes element documents, extracting all dependencies and inlining them ...
gulp.task('vulcanize', function(callback) {
    return gulp.src('./src/elements.html')
        .pipe(vulcanize({
            abspath: '',
            excludes: [],
            stripExcludes: false,
            inlineScripts: true,
            inlineCss: true
        }))
        .on('error', function(err) {
            console.log(err);
        })
        .pipe(crisper({
            scriptInHead: true,
            onlySplit: false
        }))
        .pipe(gulp.dest('./dist'))
        .on('error', function(err) {
            console.log(err);
        });
});

// build task which executes each build step in order ...
gulp.task('build', function(callback){
    runSequence('eslint', 'vulcanize', 'babel', 'copy', callback);
});

// basic live server task ...
gulp.task('serve', function(callback) {
    server = liveserver.static('/', 3000);
    server.start();
    callback();
});

// watch task which observes element documents and source files for changes ...
gulp.task('watch', function() {
    gulp.watch([
       'src/*.html',
       'src/elements/**/*.html',
       'src/elements/**/*.js',
       'src/elements/**/*.css',
       './src/assets/*.png',
       './src/assets/*.gif'
    ], ['build']);
    return gulp.watch(['dist/index.html', 'dist/elements.html', 'dist/elements.js'], function (file) {
        server.notify.apply(server, [file]);
    });
});

// default task, cleans, copies, builds, kicks off the server and watches for changes ...
gulp.task('default', function(callback){
    runSequence('clean', 'libs', 'build', 'serve', 'watch', callback);
});

