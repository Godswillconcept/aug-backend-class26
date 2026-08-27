const pluralize = require("pluralize");
const _ = require("lodash");
const http = require("http");
const { users } = require("./example");

const word1 = "fish";
const word2 = "developer";

// console.log(
//   `the plural of ${word1} based on the count ${0} is ${pluralize(word1, 0)}`,
// );
// console.log(
//   `the plural of ${word2} based on the count ${0} is ${pluralize(word2, 0)}`,
// );
// console.log(
//   `the plural of ${word1} based on the count ${0} is ${pluralize(word1, 0)}`,
// );

// console.log(pluralize.isPlural("developer"));
// console.log(pluralize.isSingular("toothpaste"));
// console.log(pluralize.plural("mouse"));
// console.log(pluralize.singular("dice"));

// const person = {
//   name: "Aluko Tosin",
//   email: "aluko.tosin@gmail.com",
//   phone: "08036096348",
//   address: {
//     street: "123 Main St",
//     city: "Akure",
//     state: "Ondo",
//     country: "Nigeria",
//   },
// };
// const output = _.pick(person, ["name", "email", "phone"]);
// console.log(output);

// const capitalize = _.capitalize("aluko tosin");
// console.log(capitalize);

// const words = ["aluko", "tosin", "august", "developer", "ogbe"];
// const capitalizeWords = _.map(words, _.capitalize);
// console.log(capitalizeWords);
// const camelCase = _.camelCase("aluko tosin");
// console.log(camelCase);
// const snakeCase = _.snakeCase("aluko tosin");
// console.log(snakeCase);
// const kebabCase = _.kebabCase("aluko tosin");
// console.log(kebabCase);
// const upperCase = _.upperCase("aluko tosin");
// console.log(upperCase);
// const lowerCase = _.lowerCase("ALUKO TOSIN");
// console.log(lowerCase);
// const startCase = _.startCase("aluko tosin");
// console.log(startCase);
// const last = _.last(words);
// console.log(last);

// const first = _.first(words);
// console.log(first);

const server = http.createServer((req, res) => {
  res.writeHead("200", { "Content-Type": "application/json" });
  const url = req.url;
  if (url === "/") {
    const responseData = {
      name: "Aluko Tosin",
      email: "[EMAIL_ADDRESS]",
      phone: "08036096348",
      address: {
        street: "123 Main St",
        city: "Akure",
        state: "Ondo",
        country: "Nigeria",
      },
    };
    res.end(JSON.stringify(responseData));
  } else if (url === "/about") {
    res.end(
      JSON.stringify({
        message: "Welcome to the about page",
        author: "Olatunji Abass",
      }),
    );
  } else {
    res.end(JSON.stringify({ message: "Welcome to the 404 page" }));
  }
});

server.listen(3000, () => {
  console.log(`Server is running on port 3000 \nvisit http://localhost:3000`);
});
users.forEach((user) => {
  console.log(user);
});
