'use strict';

import gulp from 'gulp';
import browserSync from 'browser-sync';
import smoosher from 'gulp-smoosher';
import inlineImg from 'gulp-inline-image-html';
import sass from 'gulp-sass';
import cssBase64 from 'gulp-css-base64';
import autoprefixer from 'gulp-autoprefixer';
import babel from 'gulp-babel';
import plumber from 'gulp-plumber';
import rename from 'gulp-rename';
import del from 'del';
import tinypng from 'gulp-tinypng-compress';
import run from 'run-sequence';
import archive from 'gulp-zip';
import args from 'yargs';

const reload = browserSync.reload;

gulp.task('index', () =>
  gulp
    .src('src/index.html')
    .pipe(inlineImg('src'))
    .pipe(gulp.dest('build'))
    .pipe(browserSync.stream())
)

gulp.task('css', () =>
  gulp.src('src/sass/main.scss')
    .pipe(plumber())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 7 versions']
    }))
    .pipe(cssBase64({
      maxWeightResource: 10000000000000
      // extensionsAllowed: ['.png', '.jpg']
    }))
    .pipe(rename('style.css'))
    .pipe(gulp.dest('build'))
    .pipe(browserSync.stream())
)

gulp.task('js', () =>
  gulp.src('src/js/main.js')
  .pipe(plumber())
  .pipe(babel())
  .pipe(rename('script.js'))
  .pipe(gulp.dest('build'))
  .pipe(browserSync.stream())
);

gulp.task('vendor', () =>
  gulp
  .src('node_modules/animejs/anime.min.js')
  .pipe(rename('vendor.js'))
  .pipe(gulp.dest('build'))
);

gulp.task('img', () =>
  gulp.src('src/img/*.{png,jpg,jpeg}')
  .pipe(tinypng({
    key: 'urVfM12UzauJxyzvbNtQRcKY-QUrzJBO',
    sigFile: 'src/img/.tinypng-sigs',
    log: true
  }))
  .pipe(gulp.dest('src/img'))
);

gulp.task('browser-sync', () =>
  browserSync({
    server: {
      baseDir: 'build'
    },
    port: 8081,
    open: true,
    notify: false
  })
);

gulp.task('watcher', ['clean', 'index', 'css', 'vendor', 'js', 'browser-sync'], () => {
  gulp.watch('src/*.html', ['index']);
  gulp.watch('src/sass/**/*.scss', ['css']);
  gulp.watch('src/js/**/*.js', ['js']);
});

gulp.task('clean', () => del('build'));

gulp.task('dist', () => {
  del('dist');
  gulp.src('build/index.html')
    .pipe(smoosher())
    .pipe(gulp.dest('dist'))
  gulp.src('build/script.js')
    .pipe(gulp.dest('dist'));
  gulp.src('build/vendor.js')
    .pipe(gulp.dest('dist'));
});

gulp.task('zip', () => {
  let name;
  if (args.argv.name == true || args.argv.name == undefined) {
    name = 'archive.zip';
  } else {
    name = args.argv.name + '.zip';
  }
  console.log(args.argv.name);
  gulp.src('dist/*')
    .pipe(archive(name))
    .pipe(gulp.dest(''))
});

gulp.task('prod', (fn) => {
  run(
    'clean',
    'img',
    'index',
    'css',
    'vendor',
    'js',
    'dist',
    fn);
});
