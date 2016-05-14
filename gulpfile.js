var gulp = require('gulp'),
	env = require('gulp-env'),
	mocha = require('gulp-mocha'),
	nodemon = require('gulp-nodemon'),
    runSequence = require('run-sequence');

gulp.task('test', function() {
	env({vars: { NODE_ENV: 'test' }});

    return gulp.src('./tests/main.server.tests.js', { read: false })
        .pipe(mocha());
});

gulp.task('watch-tests', function() {
    gulp.watch(['./**/*.js', '!./node_modules/**/*'], ['test']);
});

gulp.task('run-tests', function(cb) {
    runSequence('test', 'watch-tests', cb);
});

gulp.task('nodemon', function() {
    nodemon({
        script: 'server.js',
        ext: 'js',
        env: { NODE_ENV: 'development' },
        ignore: ['gulpfile.js', './tests']
    });
});

gulp.task('default', function(cb) {
    runSequence('test', 'nodemon', cb);
});