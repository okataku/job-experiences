let gulp = require("gulp");
let sass = require("gulp-sass");
let pug = require("gulp-pug");
let prefixer = require("gulp-autoprefixer");
let plumber = require("gulp-plumber");
let yaml = require("js-yaml");
let fs = require("fs");
let path = require("path");

let config = {
  sass: "./src/*.scss",
  sass_exclude: "!./src/_*.scss",
  pug: "./src/*.pug",
  dest: "./public",
  data: "./src/data.yml",
  dict: "./src/dictionary.yml",
}

gulp.task("sass", function() {
  return gulp.src([config.sass, config.sass_exclude])
    .pipe(sass({outputStyle: "expanded"}).on("error", sass.logError))
    .pipe(prefixer())
    .pipe(gulp.dest(config.dest));
});

gulp.task("pug", function() {
  let data_path = path.resolve(__dirname, config.data);
  let dict_path = path.resolve(__dirname, config.dict);
  let locals = {
      careers: yaml.safeLoad(fs.readFileSync(data_path, 'utf8')).careers,
      dict: yaml.safeLoad(fs.readFileSync(dict_path, 'utf8')),
      helper: {
        year: (career) => {
          return career.from ? career.from.getFullYear() + "年" : "";
        },
        month: (career) => {
          return career.from ? career.from.getMonth() + 1 + "月" : "";
        },
        periodOfProject: (career) => {
          return Math.ceil((career.to - career.from) / (1000 * 3600 * 24 * 30)) + "ヶ月";
        },
        memberCount: (career) => {
          return career.member ? `${career.member}人`: "";
        }
      }
  }
  return gulp.src(config.pug)
    .pipe(plumber())
    .pipe(pug({ pretty: true, locals: locals}))
    .pipe(gulp.dest(config.dest));
});

gulp.task("watch", ()=>{
  gulp.watch(config.sass, ['sass']);
  gulp.watch([config.pug, config.data], ['pug']);
});
gulp.task("default", ["sass", "pug"]);
