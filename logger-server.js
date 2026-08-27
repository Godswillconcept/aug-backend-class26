const http = require("node:http");
const { URL } = require("node:url");

const server = http.createServer((req, res) => {
  //   console.log(
  //     `method: ${req.method}, URL: ${req.url}, User-Agent: ${req.headers["user-agent"]}`,
  //   );
  //   res.writeHead(200, { "Content-Type": "text/plain" });
  //   res.end("Request logged successfully");
  const sampleUrl = new URL(
    "/greet?name=Abass&age=",
    `http://${req.headers.host}`,
  );
  let userAge = sampleUrl.searchParams.get("age");
  let userName = sampleUrl.searchParams.get("name");
  console.log(userAge, userName); //
  console.log({ userAge, userName }); //
  console.log(`Name: ${userName}, Age: ${userAge}`);
});

server.listen(3000, () =>
  console.log(`Server running at http://localhost:3000`),
);
