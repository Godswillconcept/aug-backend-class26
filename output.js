const path = require("path");
const fs = require("fs");
const os = require("os");
/// 1. Nomalize and resolve the given mixed paths
// './folder/../file.txt',
// '/home/user/../docs'
// C:\\Users\\..\\file
// use your preferred method to solve this problem
let pathA = "./folder/../file.txt";
let pathB = "/home/user/../docs";
let pathC = "C:\\Users\\..\\file";
// console.log(path.normalize(pathA));
// console.log(path.normalize(pathB));
// console.log(path.normalize(pathC));
// console.log("resolve:", path.resolve(pathA, pathB, pathC));

const pathArray = [pathA, pathB, pathC];

// for (let index = 0; index < pathArray.length; index++) {
//   const element = pathArray[index];
//   console.log(`resolve: ${path.resolve(element)}`);
// }

// pathArray.forEach((element) => {
//   console.log(`resolve: ${path.resolve(element)}`);
// });

///2. Build a path to a log file inside a nested folder structure ('logs/2026/08/app.log')
// starting from __dirname. use join method and extract the following
// directory, basename, extension, and name with the appropriate methods

const logPath = path.join(__dirname, "logs", "2026", "08", "app.log");
// console.log("dir name:", path.dirname(logPath));
// console.log("base name:", path.basename(logPath));
// console.log("ext name:", path.extname(logPath));
// console.log("name:", path.basename(logPath, path.extname(logPath)));

///3. Take a full file path, break the path into its object form. Modify the name and
// extension of the file, rebuild it with format method.
let url = "D:\\Users\\user\\Documents\\file.txt";
let urlObj = path.parse(url);
// console.log("urlObj", urlObj);
urlObj.name = "newFile";
urlObj.ext = ".md";
delete urlObj.base;
// console.log("urlObj", urlObj);
const newUrl = path.format(urlObj);
// console.log("newUrl", newUrl);
// console.log("newUrlObj", path.parse(newUrl));

///4.Create a file, write text synchronously, then read it both synchronously & asynchronously.
// Compare the results and error handling

try {
  fs.writeFileSync("test.txt", "Hello World");
  console.log("File written successfully");
} catch (error) {
  console.log(error);
}
try {
  const content = fs.readFileSync("./test.txt", "utf-8");
  console.log("content", content);
} catch (error) {
  console.log(error);
}
fs.readFile("./test.txt", "utf-8", (err, data) => {
  if (err) {
    console.log(err);
  }
  console.log("data", data);
});

///5. Get the current user information, temporary directory, and home directory of
// Nodejs environment
console.log("user info", os.userInfo());
console.log("temp dir", os.tmpdir());
console.log("home dir", os.homedir());

///6. Create a nested directory structure, list its contents and delete it safely

const dirPath = path.join(__dirname, "folder", "subfolder");
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
  console.log("dir created");
}
if (fs.existsSync(dirPath)) {
  try {
    const files = fs.readdirSync(dirPath);
    console.log(`dirPath exists with these files \n ${files.join(", ")}`);
  } catch (error) {
    console.log("error", error);
  }
}
if (fs.existsSync(dirPath)) {
  try {
    fs.rmSync(dirPath, { recursive: true });
    console.log("dirPath deleted");
  } catch (error) {
    console.log(error);
  }
}

///7. An  imaginary txt file is created in docs/pdf directory of your working directory,
// modify the context of the file to include your name and date value. Then move the file to
// markdown folder in the docs folder. Return the absolute path to the imaginary file,
// then read the content synschronously

const filePath = path.join(__dirname, "docs", "pdf", "file.txt");
const markdownPath = path.join(__dirname, "docs", "markdown", "file.txt");
if (!fs.existsSync(filePath)) {
  const pdfDir = path.dirname(filePath);
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
  }
  fs.writeFileSync(
    filePath,
    `Abass - ${new Date().toLocaleDateString()}`,
    "utf8",
  );
  console.log("file created");
  const markdownDir = path.join(__dirname, "docs", "markdown");
  if (!fs.existsSync(markdownDir)) {
    fs.mkdirSync(markdownDir, { recursive: true });
  }
  fs.renameSync(filePath, markdownPath);
  console.log(path.resolve(markdownPath));
  try {
    const content = fs.readFileSync(markdownPath, "utf-8");
    console.log("content", content);
  } catch (error) {
    console.log(error);
  }
}
