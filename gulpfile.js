// Require Gulp, Sass, and browser-sync

const gulp          = require('gulp');
const pump          = require('pump');
const browserSync   = require('browser-sync').create();
const sass          = require('gulp-sass');
const useref        = require('gulp-useref');
const uglify        = require('gulp-uglify');
const gulpIf        = require('gulp-if');
const cssnano       = require('gulp-cssnano');
const imagemin      = require('gulp-imagemin');
const cache         = require('gulp-cache');
const autoprefixer  = require('gulp-autoprefixer');
const babel         = require('gulp-babel');
const del           = require('del');


// Move vendor files from node modules to src folders

// Move Fonts (font awesome) to src/fonts

gulp.task('fonts', () =>
  gulp.src('node_modules/font-awesome/fonts/*')
    .pipe(gulp.dest('src/fonts'))
);

// Move Font Awesome Icons CSS to src/css/vendor

gulp.task('fa', () =>
  gulp.src('node_modules/font-awesome/css/font-awesome.min.css')
    .pipe(gulp.dest('src/css/vendor'))
);

// Move JS Files to src/js

gulp.task('js', () =>
    gulp.src(['node_modules/bootstrap/dist/js/bootstrap.min.js', 'node_modules/jquery/dist/jquery.min.js','node_modules/popper.js/dist/umd/popper.min.js'])
        .pipe(gulp.dest("src/js"))
        .pipe(browserSync.stream())
);

// Compile Sass & Inject Into Browser (Watched)

gulp.task('sass', () =>
  gulp.src(['node_modules/bootstrap/scss/bootstrap.scss', 'src/scss/*.scss'])
      .pipe(sass())
      .pipe(gulp.dest("src/css"))
      .pipe(browserSync.stream())
);

// Add vendor prefixes to src CSS and move to dist

gulp.task('autoprefix', () =>
    gulp.src('src/css/*.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('dist/css'))
);

// Compile ES6 to ES5 with Babel

gulp.task('compilejs', () =>
    gulp.src('src/js/*.js')
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(gulp.dest('dist/js'))
);

// Optimize Images and cache (Watched)

gulp.task('img', () =>
  gulp.src('src/img/*.+(png|jpg|jpeg|gif|svg)')
    .pipe(cache(imagemin({
          interlaced: true
        })))
  .pipe(gulp.dest('dist/images'))
);

// Live Reload function

// Serve and Watch src files

gulp.task('browserSync', gulp.parallel('sass', function() {
  browserSync.init({
      server: "./src",
      port: 8082     // Change port as needed, 8082 is for Cloud 9 workspace
}),
    gulp.watch("src/scss/*.scss", gulp.parallel('sass')),
    gulp.watch("src/*.html").on('change', browserSync.reload),
    gulp.watch("src/js/*.js").on('change', browserSync.reload);
}));

// Bundle JS,CSS and minify

gulp.task('useref', () =>
  gulp.src('dist/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'))
);

// Move src files to dist

gulp.task('build:dist', () =>
    gulp.src(["src/**"])
        .pipe(gulp.dest("dist"))
);

// Clean Dist folder

gulp.task('clean:dist', () =>
  del('dist')
);

// Gulp default tasks

gulp.task('default', gulp.parallel('sass', 'js', 'fonts', 'fa', 'img', 'browserSync'));

gulp.task('build', gulp.series('clean:dist', 'build:dist', 'sass', 'fonts', 'fa', 'img', 'autoprefix', 'compilejs', 'useref'));
