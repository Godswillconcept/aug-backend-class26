const EventEmitter = require("events");

const emitter = new EventEmitter();
const cart = [];
/// Register a listener
// on, once, addListener, prependListener, prependOnceListener
// emitter.on("eventName", listener(cb))
const greetFn = function () {
  console.log("Welcome user");
};
emitter.on("greetUser", greetFn);
const valueCheck = (value) => {
  console.log(value.length);
};
emitter.on("valueCount", valueCheck);

// emitter.addListener('eventName', listener)
function oddOutput(values) {
  let oddNums = values.filter((value) => value % 2);
  console.log(oddNums);
}
emitter.addListener("printOdd", oddOutput);

emitter.once("orderCreated", ({ id, price, qty }) => {
  console.log({ id, price, qty });
});

const cartAction = (cartData) => {
  cart.push((cartData = { id: cart.length + 1, ...cartData }));
  console.log("cart", cart);
};

const cartDate = (cartData) => {
  cart.push(
    (cartData = {
      id: cart.length + 1,
      date: new Date().toLocaleDateString(),
      ...cartData,
    }),
  );
  console.log("cart", cart);
};

const validateItem = (cartData) => {
  console.log("Validating item", cartData);
};
emitter.addListener("addToCart", cartAction);
emitter.on("addToCart", cartAction);
emitter.prependListener("addToCart", validateItem);
emitter.on("addToCart", cartDate);

/// emit method is used to trigger event that is listened to
/// emitter.emit('eventName', [args]);
emitter.emit("greetUser");
// emitter.emit("valueCount", [1, 2, 4, 6, 64, 64]);
// emitter.emit("printOdd", [1, 2, 4, 6, 64, 65, 73, 98, 101]);
emitter.emit("printOdd", [1, 2, 3, 4, 5]);
emitter.emit("orderCreated", { id: 1, price: 2000, qty: 2 });
// emitter.emit("orderCreated", { productId: 2, price: 4000, qty: 1 }); // not triggered because of once
emitter.emit("addToCart", { productId: 32, category: "clothing", qty: 2 });
emitter.emit("addToCart", { productId: 3, category: "fashion", qty: 5 });
emitter.emit("addToCart", { productId: 4, category: "fashion", qty: 5 });

emitter; /// off method is used to remove a listener from an event
// emitter.off("eventName", listener);
// emitter.off("greetUser", greetFn);
emitter.emit("greetUser");
emitter.off("valueCount", valueCheck);

emitter.emit("valueCount", [45, 35, 62, 57, 63, 72, 63, 62, 53, 6]);
// emitter.off("printOdd", oddOutput);
emitter.emit("printOdd", [45, 35, 62, 57, 63, 72, 63, 62, 53, 6]);

console.log("Emitter names: ", emitter.eventNames());
console.log(
  "Listener count for addToCart:",
  emitter.listenerCount("addToCart"),
);
emitter.removeAllListeners("addToCart");
console.log(
  "Listener count for addToCart:",
  emitter.listenerCount("addToCart"),
);
console.log("Emitter names: ", emitter.eventNames());
