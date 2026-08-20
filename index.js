// const isRead = true;
// const user = {
//   name: "John Doe",
//   age: 30,
//   nationality: "American",
// };
// const arr = [12, 78, 34, 56, 90];
// const isAdmin = true;
// // alert("Welcome to the NodeJS!");

// // user = "Stephen";
// // console.log(user);

// // const volume;
// // volume = 100;

// // console.log(volume);
// /// types of errors
// // 1. Reference errors
// // 2. Syntax errors
// // 3. Type errors

// /// types of modules
// // 1. CommonJS modules - require
// // 2. ES6 modules - import/export

// module.exports = { isRead, user, arr, isAdmin };

// /// Assignments

// class Person {
//   constructor(name, age, country) {
//     this.name = name;
//     this.age = age;
//     this.country = country;
//   }
//   details() {
//     return `My name is ${this.name}, i am ${this.age} living in ${this.country}`;
//   }
// }

// const MyDetails = new Person("praise", 24, "Nigeria");
// console.log(MyDetails.details())

// // // // // // // //
// class Rectangle{
//   constructor(height, width){
//     this.height = height
//     this.width = width
//   }
//   area(){
//     return `Area ${this.height * this.width}`
//   }
//   perimeter(){
//     return` perimeter ${2 * this.width + this.height}`
//   }
// }

// const rectangle1 = new Rectangle(5, 7)
// console.log(rectangle1.area(), rectangle1.perimeter())

// class Vehicle {
//   constructor (make,model,year) {
//     this.make = make;
//     this.model = model;
//     this.year = year;
//   }
//   displayDetails(){
//     console.log("Make: " + this.make);
//      console.log("Model: " + this.model);
//       console.log("Year: " + this.year)
//   }
// }
// class Car extends Vehicle{
//   constructor(make,model,year,doors){
//     super(make,model,year)
//     this.doors = doors;
//   }
//   displayDetails(){
//     super.displayDetails()
//     console.log("Doors: " + this.doors)
//   }
//   }
// let car = new Car ("Toyota", " Corolla", 2023, 4);
// car.displayDetails();

const fs = require("fs");
const os = require("os");
const path = require("path");
const EventEmitter = require("events");

const sampleEmitter = new EventEmitter();

const fileAction = (data) => {
  const dirPath = path.join(__dirname, "users");
  const localTempDir = path.join(__dirname, "temp");
  if (!fs.existsSync(dirPath) || !fs.existsSync(localTempDir)) {
    fs.mkdirSync(dirPath, { recursive: true });
    fs.mkdirSync(localTempDir, { recursive: true });
  }
  let filePath = path.join(__dirname, "users", "index.js"); // D:\work\Alusoft\aug-backend-class\users\index.js
  try {
    fs.writeFileSync(filePath, data, "utf-8");
    console.log("File created successfully");
  } catch (error) {
    console.log(error);
  }
  // let tempDir = os.tmpdir();
  try {
    fs.renameSync(filePath, path.join(localTempDir, "index.js")); //
    console.log("Rename complete!");
  } catch (error) {
    console.log(error);
  }
  console.log("file moved to temp direction");
};

sampleEmitter.on("createAndMove", fileAction);
sampleEmitter.emit("createAndMove", "Hello world");
sampleEmitter.off("createAndMove", fileAction);
