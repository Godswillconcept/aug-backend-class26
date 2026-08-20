const { writeFile, readFileSync } = require("fs");
const http = require("http");
const { join } = require("path");

console.log(http.METHODS); // req.method
const server = http.createServer((req, res) => {
  if (req.url == "/" || req.url == "/home") {
    const indexPath = join(__dirname, "index.html");
    // writeFile(indexPath, "Hello World", (err) => {
    //   err
    //     ? res.end("Error writing file")
    //     : res.end("File written successfully");
    // });

    // using file system module, read the content of the file
    // and send it to the client
    try {
      const data = readFileSync(indexPath, "utf-8");
      res.end(data);
    } catch (error) {
      res.end("Error reading file");
    }
  } else if (req.url == "/about") {
    const aboutPath = join(__dirname, "about.html");
    try {
      const data = readFileSync(aboutPath, "utf-8");
      res.end(data);
    } catch (error) {
      res.end("Error reading file");
    }
  } else if (req.url == "/features") {
    const featuresPath = join(__dirname, "features.html");
    try {
      const data = readFileSync(featuresPath, "utf-8");
      res.end(data);
    } catch (error) {
      res.end("Error reading file");
    }
  } else if (req.url == "/contact") {
    const contactPath = join(__dirname, "contact.html");
    try {
      const data = readFileSync(contactPath, "utf-8");
      res.end(data);
    } catch (error) {
      res.end("Error reading file");
    }
  } else if (req.url == "/users" && req.method == "POST") {
    res.end("Adding record of a user");
  } else if (req.url == "/users" && req.method == "GET") {
    res.end("Getting record of a user");
  } else {
    res.end("Page not found");
  }
});

server.listen(3000, () => {
  console.log(`Server is running on port 3000 \nvisit http://localhost:3000`);
});
