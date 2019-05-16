'use strict';
var gulp = require('gulp');
var sass = require('gulp-dart-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var pixrem = require('pixrem');
var cssnano = require('cssnano');
var postcssNormalize = require('postcss-normalize');
var sourcemaps = require('gulp-sourcemaps');
var clean = require('gulp-clean');
var packageJSON = require('./package.json');
var cssDeclarationSorter = require('css-declaration-sorter');
var gzip = require('gulp-gzip');
var clone = require('gulp-clone');
var rename = require('gulp-rename');
var merge = require('merge-stream');
var header = require('gulp-header');
var fs = require('fs');
var pkg = require('./package.json');
var banner = ['/**',
   ' * <%= pkg.name %> - <%= pkg.description %>',
   ' * @version v<%= pkg.version %>',
   ' * @link <%= pkg.homepage %>',
   ' */',
   ''
].join('\n');


var SOURCE = {
   SRC: './src',
   DIST: './dist',
   DOCS: './docs',
   CSS: '/css',
   SCSS: '/scss',
   JS: '/js',
   FONTS: '/fonts',
   IMG: '/img/Exports',
   ICONS: '/icons',
};
var PATHS = {
   CSS: SOURCE.SRC + SOURCE.CSS,
   ALLCSS: SOURCE.SRC + SOURCE.CSS + "**/*.css",
   SCSS: SOURCE.SRC + SOURCE.SCSS,
   ALLSCSS: SOURCE.SRC + SOURCE.SCSS + "**/*.scss",
   FONTS: SOURCE.SRC + SOURCE.FONTS,
   ALLFONTS: SOURCE.SRC + SOURCE.FONTS + "**/*",
   JS: SOURCE.SRC + SOURCE.JS,
   ALLJS: SOURCE.SRC + SOURCE.JS + "**/*.js",
   ICONS: SOURCE.SRC + SOURCE.ICONS,
   ALLICONS: SOURCE.SRC + SOURCE.ICONS + "**/*.scss",
   IMAGES: SOURCE.SRC + SOURCE.IMAGES,
   ALLIMAGES: SOURCE.SRC + SOURCE.IMAGES + "*",
};

// Style Tasks
gulp.task('style', function () {
   console.log('Gulp Style Tasks');
   console.log('Gulp: I am making this pretty.');
   var plugins = [
      postcssNormalize( /* pluginOptions */ ),
      pixrem(),
      cssDeclarationSorter({
         order: 'smacss'
      }),
      autoprefixer({
         grid: 'autoplace'
      }),

   ];
   var css = gulp.src(PATHS.SCSS + "/*.scss")
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(postcss(plugins));
   var min = css.pipe(clone())
      .pipe(rename(function (path) {
         path.extname = ".min.css";
      }))
      .pipe(postcss([cssnano()]));

   var gz = min.pipe(clone()).pipe(gzip());

   return merge(css, min, gz)
      .pipe(sourcemaps.write('/maps'))
      .pipe(gulp.dest(SOURCE.DIST + SOURCE.CSS));
});

gulp.task("construct", function () {
   var base = gulp.src(PATHS.SCSS + '/gulp_header/_utility_only.scss').pipe(rename("base.scss"));

   var uconly = base
      .pipe(clone())
      .pipe(rename("UC_only.scss"))

      .pipe(header(fs.readFileSync(PATHS.SCSS + '/components/_uc-only.components.scss', 'utf8'), {
         pkg: pkg
      }))
      .pipe(header(fs.readFileSync(PATHS.SCSS + '/components/_components.scss', 'utf8'), {
         pkg: pkg
      }))
      .pipe(header(fs.readFileSync(PATHS.SCSS + '/gulp_header/_base-and-brand.scss', 'utf8'), {
         pkg: pkg
      }))
      .pipe(header(fs.readFileSync(PATHS.SCSS + '/gulp_header/_default-setup.scss', 'utf8'), {
         pkg: pkg
      }))
      .pipe(header("/** Utility Class Only With Basic ACC Branding **/", {
         pkg: pkg
      }));

   return merge(base, uconly)
      .pipe(header(fs.readFileSync(PATHS.SCSS + '/gulp_header/_preheader.scss', 'utf8'), {
         pkg: pkg
      }))
      .pipe(header(banner, {
         pkg: pkg
      }))
      .pipe(gulp.dest(PATHS.SCSS));
});