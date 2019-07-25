/*jslint node: true */
"use strict";
var gulp = require("gulp");
var sass = require("gulp-dart-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var pixrem = require("pixrem");
var cssnano = require("cssnano");
var postcssNormalize = require("postcss-normalize");
var sourcemaps = require("gulp-sourcemaps");
var clean = require("gulp-clean");
var packageJSON = require("./package.json");
var cssDeclarationSorter = require("css-declaration-sorter");
var gzip = require("gulp-gzip");
var clone = require("gulp-clone");
var rename = require("gulp-rename");
var merge = require("merge-stream");
var header = require("gulp-header");
var fs = require("fs");
var pkg = require("./package.json");
var run = require('gulp-run');

var banner = [
	"/**",
	" * <%= pkg.name %> - <%= pkg.description %>",
	" * @version v<%= pkg.version %>",
	" * @link <%= pkg.homepage %>",
	" */",
	""
].join("\n");

var SOURCE = {
	SRC: "./src",
	DIST: "./dist",
	DOCS: "./docs",
	CSS: "/css",
	SCSS: "/scss",
	JS: "/js",
	FONTS: "/fonts",
	IMG: "/img/Exports",
	ICONS: "/icons"
};
var PATHS = {
	CSS: SOURCE.SRC + SOURCE.CSS,
	ALLCSS: SOURCE.SRC + SOURCE.CSS + "/**/*.css",
	SCSS: SOURCE.SRC + SOURCE.SCSS,
	ALLSCSS: SOURCE.SRC + SOURCE.SCSS + "/**/*.scss",
	FONTS: SOURCE.SRC + SOURCE.FONTS,
	ALLFONTS: SOURCE.SRC + SOURCE.FONTS + "/**/*",
	JS: SOURCE.SRC + SOURCE.JS,
	ALLJS: SOURCE.SRC + SOURCE.JS + "/**/*.js",
	ICONS: SOURCE.SRC + SOURCE.ICONS,
	ALLICONS: SOURCE.SRC + SOURCE.ICONS + "/**/*.scss",
	IMAGES: SOURCE.SRC + SOURCE.IMAGES,
	ALLIMAGES: SOURCE.SRC + SOURCE.IMAGES + "*"
};

// Style Tasks
gulp.task("style", function () {
	console.log("Gulp Style Tasks");
	console.log("Gulp: I am making this pretty.");
	var plugins = [
		postcssNormalize( /* pluginOptions */ ),
		pixrem(),
		cssDeclarationSorter({
			order: "smacss"
		}),
		autoprefixer({
			grid: "autoplace"
		})
	];
	var css = gulp
		.src(PATHS.SCSS + "/*.scss")
		.pipe(sourcemaps.init())
		.pipe(sass().on("error", sass.logError))
		.pipe(postcss(plugins));
	var min = css
		.pipe(clone())
		.pipe(
			rename(function (path) {
				path.extname = ".min.css";
			})
		)
		.pipe(postcss([cssnano()]));

	var gz = min.pipe(clone()).pipe(gzip());

	return merge(css, min, gz)
		.pipe(sourcemaps.write("/maps"))
		.pipe(gulp.dest(SOURCE.DIST + SOURCE.CSS));
});

gulp.task("fontawesome", function () {
	console.log("Gulp Font Awesome Tasks");
	console.log("Gulp: Going to the store node_modules to pick up some fonts.");
	return gulp
		.src(["css/*", "webfonts/*"], {
			cwd: "./node_modules/@fortawesome/fontawesome-pro/",
			cwdbase: true
		})
		.pipe(gulp.dest(SOURCE.DIST + "/icons"));
});

gulp.task("dist", function () {
	console.log("Gulp Dist Package");
	console.log(
		"Gulp: Gosh my back is tired. Moving boxes from Assets to the styleguide"
	);
	return gulp
		.src([PATHS.ALLFONTS, PATHS.ALLICONS, PATHS.ALLJS, PATHS.ALLIMAGES], {
			base: ""
		})
		.pipe(gulp.dest(SOURCE.DIST));
});
gulp.task("copy", function () {
	console.log("Gulp Copy Dist Package to Docs");
	console.log(
		"Gulp: Gosh my back is tired. Moving boxes from Assets to the styleguide"
	);
	return gulp.src("./dist/**/*").pipe(gulp.dest(SOURCE.DOCS));
});
gulp.task("construct", function () {
	var base = gulp
		.src(PATHS.SCSS + "/gulp_header/__utilityclasses.scss")
		.pipe(rename("uc_base.scss"));
	var noframe_acc = base
		.pipe(clone())
		.pipe(rename("noframework_acc.scss"))
		.pipe(
			header(
				fs.readFileSync(PATHS.SCSS + "/recipes/__recipes.noframe.scss", "utf8"), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(
					PATHS.SCSS + "/components/__components.uc_only.scss",
					"utf8"
				), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(
					PATHS.SCSS + "/components/__components.base.scss",
					"utf8"
				), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(PATHS.SCSS + "/styleguide/_color-codes.scss", "utf8"), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(PATHS.SCSS + "/gulp_header/__setup.base.scss", "utf8"), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(PATHS.SCSS + "/gulp_header/__brand.base.scss", "utf8"), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(PATHS.SCSS + "/gulp_header/__brand.acc.scss", "utf8"), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header("/** Utility Class with No Framework Shims **/", {
				pkg: pkg
			})
		);
	var uconly = base
		.pipe(clone())
		.pipe(rename("uconly_acc.scss"))
		.pipe(
			header(
				fs.readFileSync(
					PATHS.SCSS + "/components/__components.uc_only.scss",
					"utf8"
				), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(
					PATHS.SCSS + "/components/__components.base.scss",
					"utf8"
				), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(PATHS.SCSS + "/styleguide/_color-codes.scss", "utf8"), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(PATHS.SCSS + "/gulp_header/__setup.base.scss", "utf8"), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(PATHS.SCSS + "/gulp_header/__brand.base.scss", "utf8"), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(PATHS.SCSS + "/gulp_header/__brand.acc.scss", "utf8"), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header("/** Utility Class Only With Basic ACC Branding **/", {
				pkg: pkg
			})
		);

	var zurb_acc = base
		.pipe(clone())
		.pipe(rename("zurb_acc.scss"))
		.pipe(
			header(
				fs.readFileSync(PATHS.SCSS + "/recipes/__recipes.zurb.scss", "utf8"), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(
					PATHS.SCSS + "/components/__components.zurb.scss",
					"utf8"
				), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(
					PATHS.SCSS + "/components/__components.base.scss",
					"utf8"
				), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(PATHS.SCSS + "/gulp_header/__setup.zurb.scss", "utf8"), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(PATHS.SCSS + "/gulp_header/__brand.base.scss", "utf8"), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(PATHS.SCSS + "/gulp_header/__brand.acc.scss", "utf8"), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header("/** Utility Class Only With Basic ACC Branding **/", {
				pkg: pkg
			})
		);

	var boot_acc = base
		.pipe(clone())
		.pipe(rename("boot_acc.scss"))
		.pipe(
			header(
				fs.readFileSync(PATHS.SCSS + "/recipes/__recipes.acc.scss", "utf8"), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(PATHS.SCSS + "/recipes/__recipes.boot.scss", "utf8"), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(
					PATHS.SCSS + "/components/__components.acc.scss",
					"utf8"
				), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(
					PATHS.SCSS + "/components/__components.boot.scss",
					"utf8"
				), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(
					PATHS.SCSS + "/components/__components.base.scss",
					"utf8"
				), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(PATHS.SCSS + "/gulp_header/__setup.boot.scss", "utf8"), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(PATHS.SCSS + "/gulp_header/__brand.base.scss", "utf8"), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(PATHS.SCSS + "/gulp_header/__brand.acc.scss", "utf8"), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				"/**Set Active Class for Bootstrap **/ \n $active-class-name: 'active';\n", {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				"/** Utility Class Built on top of Bootstrap 4.3 with ACC Branding **/", {
					pkg: pkg
				}
			)
		);

	var boot_cvquality = base
		.pipe(clone())
		.pipe(rename("boot_cvquality.scss"))
		.pipe(
			header(
				fs.readFileSync(
					PATHS.SCSS + "/recipes/__recipes.cvquality.scss",
					"utf8"
				), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(PATHS.SCSS + "/recipes/__recipes.boot.scss", "utf8"), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(
					PATHS.SCSS + "/components/__components.cvquality.scss",
					"utf8"
				), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(
					PATHS.SCSS + "/components/__components.boot.scss",
					"utf8"
				), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(
					PATHS.SCSS + "/components/__components.base.scss",
					"utf8"
				), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(PATHS.SCSS + "/base/__cvquality.base.scss", "utf8"), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(PATHS.SCSS + "/gulp_header/__setup.boot.scss", "utf8"), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(PATHS.SCSS + "/gulp_header/__brand.base.scss", "utf8"), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				fs.readFileSync(
					PATHS.SCSS + "/gulp_header/__brand.cvquality.scss",
					"utf8"
				), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				"/**Set Active Class for Bootstrap **/ \n $active-class-name: 'active';\n", {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(
				"/** Utility Class Built on top of Bootstrap 4.3 with CVQuality Branding **/", {
					pkg: pkg
				}
			)
		);

	return merge(uconly, zurb_acc, boot_acc, noframe_acc, boot_cvquality)
		.pipe(
			header(
				fs.readFileSync(PATHS.SCSS + "/gulp_header/__preheader.scss", "utf8"), {
					pkg: pkg
				}
			)
		)
		.pipe(
			header(banner, {
				pkg: pkg
			})
		)
		.pipe(gulp.dest(PATHS.SCSS));
});

gulp.task("watch", function () {
	console.log("Gulp Watch Tasks");
	console.log(
		"Gulp: I will be watching you.... even when you sleep..... creapy"
	);
	return gulp.watch(
		[PATHS.ALLSCSS, "!" + PATHS.SCSS + "*.scss"],
		gulp.series("build")
	);
});

gulp.task(
	"styleguide",
	function () {
		return run(
			"npm run index && npm run uc && npm run zurb_acc &&  npm run boot_acc &&  npm run boot_cvquality"
		).exec();
	}
);

gulp.task("build", gulp.series("construct", "style", "dist", "copy"));
gulp.task("default", gulp.series("build", "watch"));