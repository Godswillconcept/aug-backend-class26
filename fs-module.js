const fs = require("node:fs");

// console.log("fs", fs);

/// Read Operations

// readFile(path, options, cb)

// const file = "./app.jsx";
// fs.readFile(file, function (err, data) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(data.toString());
//   }
// });

// fs.readFile("./sample.txt", "utf8", function (err, data) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(data);
//   }
// });

/// readFileSync
// try {
//   const data = fs.readFileSync("./message.pdf", "utf8");
//   console.log("data: ", data);
// } catch (error) {
//   console.log("fail to read file");
// }

/// create file
// fs.writeFile(filename, data/content, options, cb);
// const content = `<h1>Hello World</h1>`;

// fs.writeFile("./index.html", content, function (err) {
//   if (err) {
//     console.error("error: ", err);
//   } else {
//     console.log("file created successfully");
//   }
// });

// const info = `body { background-color: #f0f0f0; };
//  h1 { color: #333; }; `;
// try {
//   fs.writeFileSync("./style.css", info);
//   console.log("File created");
// } catch (error) {
//   console.log("error", error);
// }

// append file
// const newContent = `<p> This is a new paragraph</p>`;
// fs.appendFile("./index.html", newContent, (err) => {
//   if (err) {
//     console.log("error: ", err);
//   } else {
//     console.log("file appended successfully");
//   }
// });

// try {
//   fs.appendFileSync("./main.js", 'console.log("Hello World");');
//   console.log("File appended successfully with sync");
// } catch (error) {
//   console.log("error", error);
// }

// creating folder with fs.mkdir()
// fs.mkdir("./styles", { recursive: true }, (err) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Directory created successfully");
//   }
// });

// reading folder content
// fs.readdir(__dirname, (err, files) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("files: ", files);
//   }
// });

// fs.writeFile(
//   "./styles/index.css",
//   "body { background-color: #f0f0f0; }",
//   "utf-8",
//   (err) => {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log("file created successfully");
//     }
//   },
// );

// fs.copyFile("./style.css", "./styles/style.css", (err) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("file copied successfully");
//   }
// });

// fs.rename("./style.css", "./styles/style.css", (err) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("file renamed successfully");
//   }
// });

// delete a file
// fs.unlink("./sample.txt", (err) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("file deleted successfully");
//   }
// });

// delete a folder
fs.rm("./public", { recursive: true }, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("folder deleted successfully");
  }
});
fs.rm("./styles", { recursive: true, force: true }, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("folder deleted successfully");
  }
});
