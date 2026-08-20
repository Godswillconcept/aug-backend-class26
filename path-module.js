// // const path = require('path'); // old syntax
const path = require("node:path"); // latest syntax

// // console.log(path);

// /// Seperator (property)
// // console.log("seperator", path.sep);
// /// Delimiter (property)
// // console.log("delimiter", path.delimiter);
// // console.log("__dirname", __dirname); // return the directory name in absolute path
// // console.log("__filename", __filename); // return the file name in absolute path
// // Methods
// /// dirname: path.dirname(filePath); // return the directory name in absolute path
// const profile = "D:\\downloads\\images\\profile.png";
// // console.log(path.dirname(profile));

// /// basename: path.basename(filePath)
// // console.log("basename", path.basename(profile));
// // console.log("basename", path.basename(profile, ".png"));
// /// extname: path.extname(filePath)

// /// format returns string equivalent of the path object
// const format = path.format({
//   dir: "D:\\downloads\\images",
//   name: "profile",
//   ext: ".png",
// });
// // console.log("format", format);
// /// parse: path.parse(filePath) returns an object of the file path
// const parsed = path.parse(profile);
// // console.log("parsed", parsed);
// /// isAbsolute: path.isAbsolute(filePath) returns true if the path is absolute
// console.log("isAbsolute", path.isAbsolute(profile));

// /// a function that checks if the path supplied as parameter is a relative path,
// // returns true if it is a relative path

// const isRelative = (filePath) => !path.isAbsolute(filePath);
// console.log("isRelative", isRelative(profile));

// /// join: path.join(path1, path2, path3, ...) returns the path as a string
// const join = path.join("D:\\projects", "backend", "src", "app.js");
// console.log("join", join);
// console.log(path.join("dir", "folder", "file.txt"));

// // const fname = "Olatunji";
// // const lname = "Abass";
// // const full_name = fname.concat(" ", lname);
// //  "dir" + "/" + "folder" + "/" + "file.txt"

// /// resolve: path.resolve(path1, path2, path3, ...) returns the absolute path
// const resolve = path.resolve("D:\\projects", "backend", "src", "app.js");
// console.log("resolve", resolve);
// console.log(path.resolve("dir", "folder", "file.txt"));

// /// normalize: path.normalize(filePath) returns the normalized path

// const file = "D:\\projects\\backend\\src\\..\\app.js";
// console.log("normalize", path.normalize(file));
// console.log(path.normalize("D:/downloads/documents/./pdf/../resume.pdf"));

// /// relative: path.relative(from, to) returns the relative path from the from path to the to path
// console.log(
//   "relative",
//   path.relative("D:\\projects\\backend", "D:\\projects\\frontend"),
// );
const pathA = "D:\\react\\src\\app.jsx";
const pathB = "D:\\react\\src\\components\\Buttons.jsx";
console.log("relative", path.relative(pathA, pathB));

// const url = "D:\\laravel\\sdms\\components\\admin\\app.blade.php";
// console.log(path.dirname(url));

console.log(path.relative("../store/phones/", "../products/42?currency=NGN"));
