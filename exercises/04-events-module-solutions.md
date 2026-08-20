# Instructor Guide and Solutions: Node.js `events`

> Based on the [official Node.js Events documentation](https://nodejs.org/docs/latest/api/events.html), reviewed on 11 August 2026. Keep this guide separate during assessed exercises.

Unless otherwise shown:

```js
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
```

## Part A solutions

### Exercise 1

- Target: `button`
- Event type: `click`
- Listener: `handleClick`
- Event object: `event`
- Trigger: `button.click()`; a real user click could also trigger it

### Exercise 2

```js
const { EventEmitter } = require("node:events");
const buttonEvents = new EventEmitter();

function handleClick(payload) {
  console.log("click", payload.source);
}

buttonEvents.on("click", handleClick);
buttonEvents.emit("click", { source: "manual" });
```

There is no DOM element, automatic Event object, default button action, capture phase, or bubbling tree.

### Exercise 3

The second `onclick` assignment replaces the first property value. Two `addEventListener()` calls can preserve two different listeners. Two `emitter.on()` calls also register both and invoke them in registration order.

### Exercise 4

| Concern | DOM `EventTarget` | Node `EventEmitter` |
| --- | --- | --- |
| Subscribe | `addEventListener()` | `on()` |
| Trigger | `dispatchEvent()` | `emit()` |
| Remove | `removeEventListener()` | `off()` |
| Once | `{ once: true }` | `once()` |
| Data | Event/CustomEvent object | Arbitrary arguments |
| Propagation | DOM capture/target/bubble | None |
| Unhandled `error` | No EventEmitter-style rule | Throws for `'error'` |

## Part B solutions

### Exercise 5

```js
const emitter = new EventEmitter();
emitter.on("courseStarted", ({ title, students }) => {
  console.log(`${title} started with ${students} students.`);
});
emitter.emit("courseStarted", { title: "Node.js Backend", students: 20 });
```

### Exercise 6

```js
const emitter = new EventEmitter();
emitter.on("paymentCompleted", (paymentId, amount, currency) => {
  console.log({ paymentId, amount, currency });
});
emitter.emit("paymentCompleted", "pay-1", 5000, "NGN");

const second = new EventEmitter();
second.on("paymentCompleted", (payment) => console.log(payment));
second.emit("paymentCompleted", {
  paymentId: "pay-1",
  amount: 5000,
  currency: "NGN",
});
```

One object is usually easier to extend compatibly with named fields.

### Exercise 7

```text
before
A
B
after true
missing false
```

### Exercise 8

```js
const emitter = new EventEmitter();
emitter.on("calculate", () => 10);
emitter.on("calculate", () => 20);
console.log(emitter.emit("calculate")); // true
```

Use a direct function returning a value or Promise when the caller needs the result:

```js
async function calculate() {
  return 20;
}

const result = await calculate();
```

### Exercise 9

```js
const emitter = new EventEmitter();
emitter.on("check", function () {
  console.log("ordinary", this === emitter); // true
});
emitter.on("check", () => {
  console.log("arrow", this === emitter); // false
});
emitter.emit("check");
```

The arrow retains lexical `this`; its exact top-level value depends on module/runtime context.

### Exercise 10

```js
const emitter = new EventEmitter();
let calls = 0;
function listener() { calls += 1; }

emitter.on("run", listener);
emitter.on("run", listener);
emitter.on("run", listener);
assert.equal(emitter.listenerCount("run"), 3);

emitter.emit("run");
assert.equal(calls, 3);

emitter.off("run", listener);
assert.equal(emitter.listenerCount("run"), 2);
emitter.emit("run");
assert.equal(calls, 5);

emitter.off("run", listener);
emitter.off("run", listener);
assert.equal(emitter.listenerCount("run"), 0);
```

## Part C solutions

### Exercise 11

```js
const emitter = new EventEmitter();
let initializations = 0;
let statuses = 0;

emitter.once("connected", () => { initializations += 1; });
emitter.on("connected", () => { statuses += 1; });

emitter.emit("connected");
emitter.emit("connected");
emitter.emit("connected");

assert.equal(initializations, 1);
assert.equal(statuses, 3);
```

### Exercise 12

Each arrow expression creates a different function object.

```js
function handleStatus() {
  console.log("changed");
}

emitter.on("status", handleStatus);
emitter.off("status", handleStatus);
```

### Exercise 13

```js
function subscribe(emitter, eventName, listener) {
  emitter.on(eventName, listener);
  return () => emitter.off(eventName, listener);
}

let calls = 0;
const unsubscribe = subscribe(emitter, "message", () => { calls += 1; });
emitter.emit("message");
unsubscribe();
emitter.emit("message");
assert.equal(calls, 1);
```

### Exercise 14

```js
const output = [];
const emitter = new EventEmitter();

emitter.on("run", () => output.push("normalA"));
emitter.on("run", () => output.push("normalB"));
emitter.prependListener("run", () => output.push("firstEveryTime"));
emitter.prependOnceListener("run", () => output.push("firstOnlyOnce"));

emitter.emit("run");
// firstOnlyOnce, firstEveryTime, normalA, normalB
emitter.emit("run");
// firstEveryTime, normalA, normalB
```

The most recently prepended listener is at the front.

### Exercise 15

```js
const output = [];
const emitter = new EventEmitter();

function listenerB() { output.push("B"); }
function listenerA() {
  output.push("A");
  emitter.off("work", listenerB);
}

emitter.on("work", listenerA);
emitter.on("work", listenerB);
emitter.emit("work"); // A, B
emitter.emit("work"); // A
assert.deepEqual(output, ["A", "B", "A"]);
```

The current emission uses the listeners that were present when emission began.

## Part D solutions

### Exercise 16

```js
const path = require("node:path");

class FileProcessor extends EventEmitter {
  process(fileName) {
    if (path.extname(fileName).toLowerCase() !== ".txt") {
      this.emit("error", new Error(`Unsupported file: ${fileName}`));
      return false;
    }
    this.emit("processed", { fileName });
    return true;
  }
}

const processor = new FileProcessor();
processor.on("error", (error) => console.log(error.message));
processor.on("processed", ({ fileName }) => console.log(fileName));
processor.process("lesson.txt");
processor.process("image.png");
```

### Exercise 17

```js
const { EventEmitter, errorMonitor } = require("node:events");
const emitter = new EventEmitter();
const output = [];

emitter.on(errorMonitor, () => output.push("monitor"));
emitter.on("error", () => output.push("handler"));
emitter.emit("error", new Error("boom"));
assert.deepEqual(output, ["monitor", "handler"]);
```

With only the monitor, the error still throws.

### Exercise 18

```js
const emitter = new EventEmitter();
const output = [];

emitter.on("run", () => {
  output.push("first");
  throw new Error("stop");
});
emitter.on("run", () => output.push("second"));

try {
  emitter.emit("run");
} catch (error) {
  output.push("caught");
}

assert.deepEqual(output, ["first", "caught"]);
```

The exception propagates out of `emit()`, so later EventEmitter listeners do not run. Node EventTarget documents that one handler error does not prevent other handlers from being invoked; the error is handled later as an uncaught exception by default.

### Exercise 19

```text
before
listener start
after
listener end
```

`emit()` calls the async function but ignores its Promise.

### Exercise 20

```js
const emitter = new EventEmitter({ captureRejections: true });
const received = new Promise((resolve) => emitter.once("error", resolve));

emitter.on("save", async () => {
  throw new Error("save failed");
});

emitter.emit("save");
assert.equal((await received).message, "save failed");
```

## Part E solutions

### Exercise 21

```js
const emitter = new EventEmitter();
const symbolEvent = Symbol("internal");
const persistent = () => {};
const oneTime = () => {};

emitter.on("data", persistent);
emitter.once("ready", oneTime);
emitter.on(symbolEvent, () => {});

console.log(emitter.eventNames());
console.log(emitter.listenerCount("data"));
console.log(emitter.listeners("data"));
console.log(emitter.listeners("ready"));     // original listener
console.log(emitter.rawListeners("ready"));  // once wrapper
console.log(emitter.getMaxListeners());
```

### Exercise 22

```js
const emitter = new EventEmitter();
for (let index = 0; index < 11; index += 1) {
  emitter.on("data", () => {});
}
```

Real causes include registering per request without cleanup and running initialization repeatedly. The warning is diagnostic, not a hard listener limit.

### Exercise 23

```js
const { EventEmitter, once } = require("node:events");
const emitter = new EventEmitter();

setImmediate(() => emitter.emit("ready", "api", 3000));
const [name, port] = await once(emitter, "ready");
assert.equal(name, "api");
assert.equal(port, 3000);
```

### Exercise 24

```js
const { EventEmitter, once } = require("node:events");
const emitter = new EventEmitter();

const ready = once(emitter, "ready");
emitter.emit("error", new Error("failed"));
await assert.rejects(ready, /failed/);

const expectedError = once(emitter, "error");
emitter.emit("error", new Error("observed"));
const [error] = await expectedError;
assert.equal(error.message, "observed");
```

### Exercise 25

```js
const { EventEmitter, once } = require("node:events");
const emitter = new EventEmitter();
const controller = new AbortController();
const waiting = once(emitter, "ready", { signal: controller.signal });
controller.abort();

await assert.rejects(waiting, (error) => error.name === "AbortError");
```

### Exercise 26

```js
const { EventEmitter, on } = require("node:events");
const emitter = new EventEmitter();
const controller = new AbortController();
const received = [];

const consumer = (async () => {
  try {
    for await (const [message] of on(emitter, "message", {
      signal: controller.signal,
    })) {
      received.push(message);
      if (received.length === 3) controller.abort();
    }
  } catch (error) {
    if (error.name !== "AbortError") throw error;
  }
})();

emitter.emit("message", "one");
emitter.emit("message", "two");
emitter.emit("message", "three");
await consumer;
assert.deepEqual(received, ["one", "two", "three"]);
```

### Exercise 27

Wrong pattern:

```js
await once(emitter, "first");
await once(emitter, "second"); // registered too late if second already emitted
```

Correct:

```js
const both = Promise.all([
  once(emitter, "first"),
  once(emitter, "second"),
]);

emitter.emit("first", 1);
emitter.emit("second", 2);
const [[first], [second]] = await both;
assert.deepEqual([first, second], [1, 2]);
```

## Part F solutions

### Exercise 28

```js
const target = new EventTarget();
const output = [];

target.addEventListener("ready", () => output.push("A"));
target.addEventListener("ready", () => output.push("B"));
target.dispatchEvent(new Event("ready"));

target.addEventListener("userCreated", (event) => {
  output.push(event.detail.name);
});
target.dispatchEvent(
  new CustomEvent("userCreated", { detail: { id: 1, name: "Ada" } })
);

assert.deepEqual(output, ["A", "B", "Ada"]);
```

EventTarget passes Event objects, ignores duplicate registration of the same listener/type/options, and has no special EventEmitter `'error'` behavior or full emitter API. Unlike hierarchical DOM targets, Node targets do not propagate through a tree.

### Exercise 29

```js
class OrderService extends EventEmitter {
  #orders = new Map();
  #nextId = 1;

  createOrder({ userId, items } = {}) {
    if (!userId || !Array.isArray(items) || items.length === 0) {
      this.emit("error", new Error("userId and at least one item are required"));
      return null;
    }

    const payload = Object.freeze({
      orderId: this.#nextId++,
      userId,
      items: Object.freeze([...items]),
      createdAt: new Date().toISOString(),
    });
    this.#orders.set(payload.orderId, payload);
    this.emit("orderCreated", payload);
    return payload;
  }

  cancelOrder(orderId, reason) {
    if (!this.#orders.has(orderId) || !reason) {
      this.emit("error", new Error("Valid order and reason required"));
      return false;
    }
    this.#orders.delete(orderId);
    this.emit("orderCancelled", Object.freeze({
      orderId,
      reason,
      cancelledAt: new Date().toISOString(),
    }));
    return true;
  }
}

const service = new OrderService();
const created = [];
function receipt(payload) { created.push(["receipt", payload.orderId]); }
service.on("error", () => {});
service.on("orderCreated", receipt);
service.on("orderCreated", (p) => created.push(["analytics", p.orderId]));
service.on("orderCreated", (p) => created.push(["inventory", p.orderId]));

const order = service.createOrder({ userId: 7, items: ["Book"] });
assert.equal(created.length, 3);
service.off("orderCreated", receipt);
assert.equal(service.cancelOrder(order.orderId, "Customer request"), true);
```

### Exercise 30

1. Direct Promise-returning function: the caller needs completion/failure.
2. EventEmitter: several in-process observers react to a completed fact.
3. EventTarget: it matches the web-compatible AbortSignal model.
4. Durable message broker: delivery must survive process failure and cross services.
5. EventEmitter: Node streams traditionally publish lifecycle events.
6. Direct awaited functions: the dependency and failure ordering should be explicit.

## Pair-project reference architecture

```js
const { EventEmitter } = require("node:events");
const { randomUUID } = require("node:crypto");

class JobProcessor extends EventEmitter {
  #queue = [];
  #running = false;
  #stopRequested = false;

  addJob(job) {
    if (!job || typeof job.type !== "string" || typeof job.run !== "function") {
      this.emit("error", new TypeError("A job requires type and run()"));
      return null;
    }
    const queued = { ...job, id: randomUUID() };
    this.#queue.push(queued);
    this.emit("jobQueued", {
      jobId: queued.id,
      type: queued.type,
      queuedAt: new Date().toISOString(),
    });
    return queued.id;
  }

  async start() {
    if (this.#running) return;
    this.#running = true;
    this.#stopRequested = false;

    try {
      while (!this.#stopRequested && this.#queue.length > 0) {
        const job = this.#queue.shift();
        this.emit("jobStarted", {
          jobId: job.id,
          startedAt: new Date().toISOString(),
        });

        try {
          const reportProgress = (percent) => {
            if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
              throw new RangeError("Progress must be between 0 and 100");
            }
            this.emit("jobProgress", { jobId: job.id, percent });
          };
          const result = await job.run(reportProgress);
          this.emit("jobCompleted", {
            jobId: job.id,
            result,
            completedAt: new Date().toISOString(),
          });
        } catch (error) {
          this.emit("jobFailed", {
            jobId: job.id,
            error,
            failedAt: new Date().toISOString(),
          });
        }
      }
    } finally {
      this.#running = false;
      if (this.#queue.length === 0) this.emit("idle");
    }
  }

  stop() {
    this.#stopRequested = true;
  }
}

module.exports = { JobProcessor };
```

This is an in-memory same-process exercise. It provides no persistence, distributed coordination, retry durability, or delivery guarantee.

## Exit-ticket answers

1. `addEventListener()`
2. `true` if listeners existed, otherwise `false`
3. Synchronously invoked; async results are not automatically awaited
4. `on()` persists; `once()` runs at most once
5. Removal matches function identity
6. The error is thrown and the process normally exits
7. No
8. Possible excessive registration or missing cleanup
9. A Promise resolving to an array of emitted arguments
10. No
