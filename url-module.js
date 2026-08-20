const url = require("node:url");

// console.log(url);

const myUrl = new URL(
  "https://www.google.com/search?q=javascript+nodejs&oq=javascript+nodejs&aqs=chrome..69i57j0i22i30l9.3237j0j7&sourceid=chrome&ie=UTF-8",
);
// console.log(myUrl);
const myReactUrl = new URL(
  "http://localhost:3000/products?type=react&category=framework",
);
// console.log("myReactUrl", myReactUrl);
const myReactViteUrl = new URL(
  "http://localhost:5173/products?type=react&category=framework#vite",
);
// console.log("myReactViteUrl", myReactViteUrl);
const adminUrl = new URL(
  "http://admin:sample@localhost:3000/admin/products?type=react&category=framework#vite",
);
console.log("adminUrl", adminUrl);
console.log(`host: ${adminUrl.host}`);
console.log(`hostname: ${adminUrl.hostname}`);
console.log(`port: ${adminUrl.port}`);
console.log(`protocol: ${adminUrl.protocol}`);
console.log(`pathname: ${adminUrl.pathname}`);
console.log(`search: ${adminUrl.search}`);
console.log(`hash: ${adminUrl.hash}`);
console.log(`username: ${adminUrl.username}`);
console.log(`password: ${adminUrl.password}`);
adminUrl.searchParams.append("version", "v1");
adminUrl.searchParams.append("type", "vite");
console.log(`searchParams: ${adminUrl.searchParams}`);
console.log(adminUrl.searchParams.getAll("type"));
const userNamePass = adminUrl.href.split("@")[0];
console.log(`userNamePass: ${userNamePass}`);
const query = adminUrl.href.split("?")[1];
console.log(`query: ${query}`);
console.log(query.split("&"));
adminUrl.searchParams.delete("version");
console.log(`searchParams: ${adminUrl.searchParams}`);
