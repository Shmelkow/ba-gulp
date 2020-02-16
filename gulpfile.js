/* //1й способ создания таска
function defaultTask(cb) {
    console.log("Hello, little pony");

    cb();
}

function noDefaultTask(cb) {
    console.log(5*5);
    console.log("Привет!!!");

    cb();
}

//Тут каждому таску присваиваем функцию, которую он должен выполнить
//Вызов: gulp sayHello

exports.default = defaultTask;

exports.sayHello = noDefaultTask; */

//2й способ

const gulp = require("gulp");
const sass = require("gulp-sass");
const rename = require("gulp-rename");
const browserSync = require("browser-sync").create();
const imageMin = require("gulp-imagemin");
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const notify = require('gulp-notify');

const paths = {
    src: {
        baseDir: "./src/**/*.*",     //paths.src.baseDir
        scss: "./src/scss/app.scss", //paths.src.scss
        html: "./src/**/*.html",     //paths.src.html
        js: "./src/js/**/*.js",      //paths.src.js
        img: "./src/img/**/*.*"      //paths.src.img
    },
    build: {
        baseDir: "./build/",  //paths.build.baseDir
        css: "./build/css/", //paths.build.css
        html: "./build/",     //paths.build.html
        js: "./build/js/",    //paths.build.js
        img: "./build/img/"   //paths.build.img
    },
};

function copyStyle(cb) {
    
    gulp.src(paths.src.scss)
        .pipe(gulp.dest(paths.build.css)); //pipe назначает куда переносить/copy

    cb(); //требование документации gulp
}

gulp.task("copyStyle", copyStyle);

//========================================//

function buildJs(cb) {
    
    gulp.src(paths.src.js)
        .pipe(gulp.dest(paths.build.js));

    cb();
}

gulp.task("buildJs", buildJs);

//========================================//

function imageTransfer(cb) {

    gulp.src(paths.src.img)
        .pipe(gulp.dest(paths.build.img));

    cb();
}

gulp.task("imageTransfer", imageTransfer);

function imageOptimize(cb) {
    gulp.src(paths.src.img)
        .pipe(imageMin({
            progressive: true,
            interlaced: true,
            svgoPlugins: [{ removeViewBox: false }]
        }))
        .pipe(gulp.dest(paths.build.img))

    cb();
}

//========================================//

function buildHtml(cb) {
    gulp.src(paths.src.html)
        .pipe(gulp.dest(paths.build.html));
    cb();
}

gulp.task("buildHtml", buildHtml);

//========================================//

function compileStyle(cb) {
    gulp.src(paths.src.scss)
        .pipe(sourcemaps.init())
            .pipe(sass({
                outputStyle: "compressed",
                errLogToConsole: true
            }))
            .on("error", notify.onError({
                message: "<%= error.message %>",
                title: "SCSS Error!!!"
            }))
            .pipe(rename({
                suffix: ".min"
            }))
            .pipe(autoprefixer())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.build.css))
        .pipe(notify(
            {
                message: "Styles task complete",
                sound: true,
                onLast: true
            }
        ));

    cb();
}

gulp.task("compileStyle", compileStyle);

//Watcher - task тасков, который запускает таски

function watchFiles(cb) {
    
    gulp.watch(paths.src.scss, compileStyle);
    gulp.watch(paths.src.html, buildHtml);
    gulp.watch(paths.src.js, buildJs);
    gulp.task(paths.src.img, imageTransfer);
    gulp.watch(paths.src.baseDir, reload);

    cb();
}

function sync(cb) {
    browserSync.init({
        server: {
            baseDir: paths.build.baseDir
        },
        port: 3000
    })
    cb();
}

function reload(cb) {
    browserSync.reload();
    cb();
}

function devBuild(cb) {
    buildHtml(cb);
    buildJs(cb);
    compileStyle(cb);
    imageTransfer(cb);

    cb();
}
gulp.task("devBuild", devBuild);


gulp.task("default", gulp.series(devBuild, gulp.parallel(sync, watchFiles)));

//task Buid
function build(cb) {
    buildHtml(cb);
    buildJs(cb);
    compileStyle(cb);
    imageOptimize(cb);

    cb();
}
//gulp.task("gulp:build", build); как вариант записи
gulp.task("build", build);



//========================================//
/*
    Можно использовать для случаев, когда нет возможности развернуть локально сайт.

    proxy: вписываем ссылку на сайт, с которым хотим работать
    files: непосредственно файл или файлы, которые будем использовать
    middltware: указали корневую папку
    rewriteRules: указали где и что нужно добавить,
    в нашем случае перед закрытием тега Head добавили подключение стилей

const browserSyncServer = require("browser-sync");

function server(cb) {
    browserSyncServer({
        proxy: "https://beetroot.academy/",
        files: "./build/css/app.min.css",
        middleware: require("serve-static")("./build/"),
        rewriteRules: [
            {
                match: new RegExp("</head>"),
                fn: function() {
                    return '<link rel="stylesheet" href="css/app.min.css">'
                }
            }
        ],
        port: 9006
    })

    //cb();
}
gulp.task("server", server);*/

//========================================//
