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
var run = require('gulp-run-command').default;

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
   var base = gulp.src(PATHS.SCSS + '/gulp_header/__utilityclasses.scss').pipe(rename("uc_base.scss"));

   var uconly = base
      .pipe(clone())
      .pipe(rename("noframework_acc.scss"))
      .pipe(header(fs.readFileSync(PATHS.SCSS + '/components/__uc-only.components.scss', 'utf8'), {
         pkg: pkg
      }))
      .pipe(header(fs.readFileSync(PATHS.SCSS + '/components/__noFramework.components.scss', 'utf8'), {
         pkg: pkg
      }))
      .pipe(header(fs.readFileSync(PATHS.SCSS + '/gulp_header/__default.setup.scss', 'utf8'), {
         pkg: pkg
      }))
      .pipe(header(fs.readFileSync(PATHS.SCSS + '/gulp_header/__default.brand.scss', 'utf8'), {
         pkg: pkg
      }))
      .pipe(header(fs.readFileSync(PATHS.SCSS + '/gulp_header/__acc.brand.scss', 'utf8'), {
         pkg: pkg
      }))
      .pipe(header("/** Utility Class Only With Basic ACC Branding **/", {
         pkg: pkg
      }));

   var zurb_acc = base.pipe(clone())
      .pipe(rename("zurb_acc.scss"))
      .pipe(header(fs.readFileSync(PATHS.SCSS + '/recipes/__zurb.recipes.scss', 'utf8'), {
         pkg: pkg
      }))
      .pipe(header(fs.readFileSync(PATHS.SCSS + '/components/__zurb.components.scss', 'utf8'), {
         pkg: pkg
      }))
      .pipe(header(fs.readFileSync(PATHS.SCSS + '/components/__noFramework.components.scss', 'utf8'), {
         pkg: pkg
      }))
      .pipe(header(fs.readFileSync(PATHS.SCSS + '/gulp_header/__zurb.setup.scss', 'utf8'), {
         pkg: pkg
      }))
      .pipe(header(fs.readFileSync(PATHS.SCSS + '/gulp_header/__default.brand.scss', 'utf8'), {
         pkg: pkg
      }))
      .pipe(header(fs.readFileSync(PATHS.SCSS + '/gulp_header/__acc.brand.scss', 'utf8'), {
         pkg: pkg
      }))
      .pipe(header("/** Utility Class Only With Basic ACC Branding **/", {
         pkg: pkg
      }));

   var boot_acc = base.pipe(clone())
      .pipe(rename("boot_acc.scss"))
      .pipe(header(fs.readFileSync(PATHS.SCSS + '/components/__boot.components.scss', 'utf8'), {
         pkg: pkg
      }))
      .pipe(header(fs.readFileSync(PATHS.SCSS + '/components/__noFramework.components.scss', 'utf8'), {
         pkg: pkg
      }))
      .pipe(header(fs.readFileSync(PATHS.SCSS + '/gulp_header/__boot.setup.scss', 'utf8'), {
         pkg: pkg
      }))
      .pipe(header(fs.readFileSync(PATHS.SCSS + '/gulp_header/__default.brand.scss', 'utf8'), {
         pkg: pkg
      }))
      .pipe(header(fs.readFileSync(PATHS.SCSS + '/gulp_header/__acc.brand.scss', 'utf8'), {
         pkg: pkg
      }))
      .pipe(header("/** Utility Class Only With Basic ACC Branding **/", {
         pkg: pkg
      }));



   return merge(uconly, zurb_acc, boot_acc)
      .pipe(header(fs.readFileSync(PATHS.SCSS + '/gulp_header/__preheader.scss', 'utf8'), {
         pkg: pkg
      }))
      .pipe(header(banner, {
         pkg: pkg
      }))
      .pipe(gulp.dest(PATHS.SCSS));
});

gulp.task("styleguide", gulp.parallel(
   run('npm run uc'),
   run('npm run zurb_acc'),
   run('npm run boot_acc')));

gulp.task("build", gulp.series("construct", "style", 'styleguide'));