# Node.js Built-in Modules: The `events` Module

> Documentation basis: [official Node.js Events API documentation](https://nodejs.org/docs/latest/api/events.html), reviewed on 11 August 2026. The current page reports Node.js v26.7.0 and marks `node:events` as **Stability: 2 — Stable**. Browser comparisons follow the web-platform `EventTarget` model documented by [MDN](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener).

## Lesson overview

Node.js uses an event-driven architecture throughout its core APIs. A server emits a connection event, a stream emits data and end events, and a process emits lifecycle events. The `node:events` module provides `EventEmitter`, the classic Node.js implementation of the observer or publish-subscribe pattern.

Students who know `onclick` already understand the central idea:

> Something happens → an event is announced → registered code responds.

The teaching challenge is separating that shared idea from the different APIs and runtime behavior.

### Learning objectives

By the end of this unit, students should be able to:

1. Explain event-driven programming using emitter, event, and listener terminology.
2. Compare `onclick`, DOM `addEventListener()`, Node `EventTarget`, and Node `EventEmitter`.
3. Register listeners with `on()` and trigger them with `emit()`.
4. Pass event data as arguments and understand listener `this` behavior.
5. Explain why `emit()` invokes listeners synchronously.
6. Use `once()`, `off()`, removal methods, and named listener references.
7. Handle the special `'error'` event safely.
8. Inspect listener counts, names, ordering, and leak warnings.
9. Await events with `events.once()` and consume them with `events.on()`.
10. Design a small event-driven backend component without hiding essential control flow.

---

## 1. Recommended way to teach this module

Use a four-stage bridge:

1. Recall a familiar browser click.
2. Name the general event pattern.
3. Replace the DOM element with a plain Node emitter.
4. Apply it to backend domain events.

### Stage 1: familiar browser code

```html
<button id="saveButton">Save</button>

<script>
  const button = document.querySelector("#saveButton");

  button.onclick = function (event) {
    console.log("Saved from a click", event.type);
  };
</script>
```

Ask the class:

- What object notices the event?
- What is the event name?
- What function responds?
- Who causes the click?

Answers: the button is the target, `click` is the type, the function is the handler, and a user or `button.click()` triggers it.

### Stage 2: prefer the general DOM API for comparison

```js
button.addEventListener("click", function (event) {
  console.log("First listener", event.type);
});

button.addEventListener("click", function () {
  console.log("Second listener");
});
```

`onclick` is a convenient single event-handler property. Assigning another function replaces the previous property value. `addEventListener()` can register multiple listeners and supports options such as `once`, capture behavior, and abort signals.

### Stage 3: translate the pattern to Node.js

```js
const { EventEmitter } = require("node:events");

const orderEvents = new EventEmitter();

orderEvents.on("created", function (order) {
  console.log("First listener", order.id);
});

orderEvents.on("created", function () {
  console.log("Second listener");
});

orderEvents.emit("created", { id: 101 });
```

The emitter replaces the DOM element. The event name is application-defined. `emit()` replaces the user/browser action. Arguments replace the automatically supplied DOM `Event` object.

### Stage 4: use a backend story

After an order is created, independent listeners can:

- send a receipt;
- update analytics;
- record an audit entry;
- notify warehouse software.

The order service announces what happened without directly containing every follow-up behavior.

---

## 2. The shared mental model

| Concept | Browser example | Node `EventEmitter` example |
| --- | --- | --- |
| Source/target | Button element | `orderEvents` object |
| Event name/type | `click` | `orderCreated` |
| Subscribe | `addEventListener()` | `on()` |
| Listener/handler | Callback function | Callback function |
| Trigger | User interaction or `dispatchEvent()` | `emit()` |
| Data | Usually an `Event` object | Any emitted arguments |
| Unsubscribe | `removeEventListener()` | `off()` / `removeListener()` |
| Once | `{ once: true }` | `once()` |

The pattern is the same: one object publishes a named occurrence and zero or more observers react.

---

## 3. Important differences from browser events

| Browser DOM events | Node `EventEmitter` |
| --- | --- |
| Usually associated with DOM elements or web APIs | Associated with any emitter object |
| `addEventListener(type, listener)` | `on(eventName, listener)` |
| `dispatchEvent(new Event(type))` | `emit(eventName, ...args)` |
| Listener usually receives one Event object | Listener receives arbitrary emitted arguments |
| Events may capture and bubble through a DOM tree | No automatic object hierarchy or propagation |
| `preventDefault()` can cancel a default action | No built-in default action to cancel |
| Duplicate same listener/type/capture registration is ignored | The same function may be registered multiple times |
| No special DOM `'error'` type rule like `EventEmitter` | Unhandled `'error'` normally throws and terminates |
| Return from `dispatchEvent()` relates to cancellation | `emit()` returns whether listeners existed |

### Critical timing nuance

Browser-generated clicks occur as part of the browser's event loop, but `dispatchEvent()` invokes handlers synchronously. Similarly, Node's `emit()` synchronously calls listeners. Do not teach “browser events are async, Node events are sync” as an absolute rule.

The accurate rule is:

> Calling `emitter.emit()` is synchronous. A listener may schedule asynchronous work, and the real-world operation that eventually causes an event may itself be asynchronous.

---

## 4. Importing `EventEmitter`

### CommonJS

```js
const { EventEmitter } = require("node:events");
```

This also works because the module's main export is the class:

```js
const EventEmitter = require("node:events");
```

The destructured form communicates intent clearly.

### ES modules

```js
import { EventEmitter } from "node:events";
```

Create an instance:

```js
const emitter = new EventEmitter();
```

---

## 5. Core vocabulary

### Emitter

The object that announces events.

```js
const emitter = new EventEmitter();
```

### Event name

A string or Symbol identifying what happened.

```js
"orderCreated"
"user:registered"
Symbol("internalEvent")
```

Event names are commonly camel-cased strings, but any valid JavaScript property key can be used. Choose past-tense domain facts such as `orderCreated` rather than commands such as `createOrder` when the event announces something that already occurred.

### Listener

A function registered to respond.

```js
function sendReceipt(order) {
  console.log(`Receipt sent for ${order.id}`);
}
```

### Emission

The act of announcing the event.

```js
emitter.emit("orderCreated", order);
```

---

## 6. `on()` and `emit()`

```js
const { EventEmitter } = require("node:events");
const emitter = new EventEmitter();

emitter.on("greet", (name) => {
  console.log(`Hello, ${name}`);
});

const handled = emitter.emit("greet", "Ada");
console.log(handled); // true

const missing = emitter.emit("unknown");
console.log(missing); // false
```

`on(eventName, listener)`:

- registers the listener at the end of the listener list;
- does not call it immediately;
- allows multiple listeners for one name;
- allows the same function to be added more than once;
- returns the emitter, allowing chaining.

`emit(eventName, ...args)`:

- synchronously invokes current listeners in registration order;
- passes every supplied argument to each listener;
- ignores and discards listener return values;
- returns `true` when at least one listener existed, otherwise `false`.

`addListener()` is an alias for `on()`.

---

## 7. Passing data to listeners

Unlike DOM handlers, an `EventEmitter` listener does not automatically receive a standard event object.

```js
emitter.on("paymentCompleted", (paymentId, amount, currency) => {
  console.log({ paymentId, amount, currency });
});

emitter.emit("paymentCompleted", "pay-81", 2500, "NGN");
```

For domain events, one payload object is often easier to evolve:

```js
emitter.emit("paymentCompleted", {
  paymentId: "pay-81",
  amount: 2500,
  currency: "NGN",
  completedAt: new Date().toISOString(),
});
```

Document payload shape. Emission does not clone data; listeners receive the same object reference and can mutate it. Prefer treating event payloads as immutable facts.

---

## 8. Listener `this`: regular versus arrow functions

For an ordinary listener function, Node intentionally sets `this` to the emitter:

```js
emitter.on("check", function () {
  console.log(this === emitter); // true
});
```

Arrow functions keep lexical `this` and do not receive the emitter binding:

```js
emitter.on("check", () => {
  console.log(this === emitter); // false
});
```

Prefer explicit variables over depending heavily on listener `this`. This makes refactoring between arrow and ordinary functions less surprising.

---

## 9. Synchronous ordering

```js
emitter.on("task", () => console.log("listener 1"));
emitter.on("task", () => console.log("listener 2"));

console.log("before");
emitter.emit("task");
console.log("after");
```

Output:

```text
before
listener 1
listener 2
after
```

All listeners finish before `emit()` returns, unless they schedule later work.

```js
emitter.on("task", () => {
  setImmediate(() => console.log("later"));
});
```

An `async` listener starts synchronously until its first `await`, but `emit()` does not await its returned Promise:

```js
emitter.on("task", async () => {
  await saveToDatabase();
  console.log("saved");
});

emitter.emit("task");
console.log("emit already returned");
```

If the caller must know that work completed successfully, a directly awaited function, task queue, or Promise-based orchestration may be clearer than a fire-and-forget event.

---

## 10. Multiple listeners and separation of concerns

```js
const orderEvents = new EventEmitter();

orderEvents.on("orderCreated", sendReceipt);
orderEvents.on("orderCreated", updateAnalytics);
orderEvents.on("orderCreated", notifyWarehouse);
```

Advantages:

- publisher does not import every reaction;
- listeners can be added independently;
- one event can trigger several concerns;
- components become easier to extend.

Costs:

- control flow becomes less visible;
- listener failures need a policy;
- ordering creates hidden coupling if listeners depend on each other;
- synchronous listeners can delay the publisher;
- unremoved listeners can retain memory.

Use events for genuine notifications, not to disguise ordinary sequential business logic.

---

## 11. `once()`

```js
emitter.once("connected", () => {
  console.log("Initial connection setup");
});

emitter.emit("connected"); // listener runs
emitter.emit("connected"); // listener is gone
```

The listener is removed before it is invoked and runs at most once.

Browser equivalent:

```js
button.addEventListener("click", handler, { once: true });
```

Good uses include initialization, first connection, one completion, and waiting for a single result.

---

## 12. Removing listeners

`off()` is an alias for `removeListener()`.

```js
function handleStatus(status) {
  console.log(status);
}

emitter.on("status", handleStatus);
emitter.off("status", handleStatus);
```

The exact same function reference is required. This does not work:

```js
emitter.on("status", () => console.log("changed"));
emitter.off("status", () => console.log("changed"));
```

Those arrow expressions create different functions.

Important removal details:

- One `removeListener()` call removes at most one matching registration.
- If the same function was registered twice, remove it twice.
- Removing during an emission does not prevent a listener already included in that emission from running; later emissions reflect the removal.
- `removeAllListeners(eventName)` removes listeners for one name.
- `removeAllListeners()` removes all listeners and should be used carefully.
- Removing listeners owned by another module is poor practice.

Lifecycle cleanup is essential for long-lived servers, sockets, sessions, and test suites.

---

## 13. Listener order and prepending

Normal listeners run in registration order.

```js
emitter.prependListener("request", auditFirst);
emitter.on("request", handleRequest);
```

`prependListener()` places a listener at the beginning. `prependOnceListener()` does the same for a one-time listener.

Use prepending sparingly. If correctness depends on many implicit listener-order relationships, explicit orchestration is usually easier to understand.

---

## 14. The special `'error'` event

`'error'` has special behavior on `EventEmitter`.

```js
const emitter = new EventEmitter();
emitter.emit("error", new Error("Database unavailable"));
```

If no `'error'` listener is registered, the error is thrown, a stack trace is printed, and the process normally exits.

Register an error listener:

```js
emitter.on("error", (error) => {
  console.error("Emitter error:", error.message);
});
```

Best practices:

- install the listener before an error can be emitted;
- pass an `Error` object;
- decide whether the component can recover;
- log useful context without secrets;
- do not silently swallow fatal states.

### `events.errorMonitor`

`errorMonitor` observes errors without consuming the special behavior:

```js
const { EventEmitter, errorMonitor } = require("node:events");
const emitter = new EventEmitter();

emitter.on(errorMonitor, (error) => {
  console.log("Monitoring:", error.message);
});
```

An `errorMonitor` listener alone does not prevent the unhandled error from throwing. A normal `'error'` listener is still needed to handle it.

DOM `EventTarget` and Node `EventTarget` do not implement this special `'error'` event rule.

---

## 15. Async listeners and `captureRejections`

An async listener can reject after `emit()` has returned:

```js
emitter.on("save", async () => {
  throw new Error("Save failed");
});
```

Create an emitter with rejection capture:

```js
const emitter = new EventEmitter({ captureRejections: true });

emitter.on("save", async () => {
  throw new Error("Save failed");
});

emitter.on("error", (error) => {
  console.error(error.message);
});

emitter.emit("save");
```

Captured rejections go to a custom `Symbol.for("nodejs.rejection")` method when defined, otherwise to `'error'`.

Do not use an async `'error'` handler with rejection capture; another rejection could create an error loop. `events.captureRejections = true` changes the default for subsequently created emitters globally, so prefer local configuration unless a project intentionally adopts a global policy.

---

## 16. Listener limits and leak warnings

The default maximum is commonly 10 listeners per event. Exceeding it does not block registration. Node emits a `MaxListenersExceededWarning` to help identify a possible memory leak.

```js
console.log(emitter.getMaxListeners());
emitter.setMaxListeners(20);
```

`events.defaultMaxListeners` controls the default for emitters, while `events.setMaxListeners(n, ...targets)` can configure several EventEmitter or EventTarget instances.

Do not “fix” every warning by setting the limit to a huge number. First ask:

- Are listeners being added per request?
- Are they removed during cleanup?
- Is the same initialization running repeatedly?
- Is one shared emitter the correct design?

Set a higher limit only when the number of legitimate subscribers is understood.

---

## 17. Introspection and diagnostics

```js
console.log(emitter.eventNames());
console.log(emitter.listenerCount("data"));
console.log(emitter.listeners("data"));
console.log(emitter.rawListeners("data"));
```

- `eventNames()` returns names with registered listeners, including Symbols.
- `listenerCount(name)` returns the number of registrations.
- `listenerCount(name, listener)` counts a particular function on supported versions.
- `listeners(name)` returns a copy; for `once()`, it exposes original functions.
- `rawListeners(name)` includes internal once wrappers.
- `getMaxListeners()` returns the configured warning threshold.

The module-level `events.getEventListeners(target, name)` works with EventEmitter and EventTarget and is useful for debugging. Do not mutate internal emitter fields such as `_events`.

---

## 18. Lifecycle meta-events

Every EventEmitter has two special lifecycle events:

### `'newListener'`

Emitted **before** a listener is added. It receives the event name and listener function. A listener inserted for the same event from inside this callback can appear before the listener currently being added.

### `'removeListener'`

Emitted **after** a listener is removed. For a listener originally added with `once()`, modern Node.js exposes the original listener function.

These are useful for instrumentation and frameworks but can create subtle ordering behavior. They are advanced topics, not the first way to teach event basics.

---

## 19. Extending `EventEmitter`

Domain classes often extend the class:

```js
const { EventEmitter } = require("node:events");

class OrderService extends EventEmitter {
  #nextId = 1;

  createOrder(items) {
    const order = {
      id: this.#nextId++,
      items,
      createdAt: new Date().toISOString(),
    };

    this.emit("orderCreated", order);
    return order;
  }
}

const service = new OrderService();
service.on("orderCreated", (order) => console.log(order));
service.on("error", console.error);
service.createOrder(["Keyboard"]);
```

Guidelines:

- complete or commit the core state change before announcing it;
- document public event names and payloads;
- avoid emitting from a constructor because consumers cannot subscribe beforehand;
- consider namespaced strings such as `order:created` for large systems;
- emit domain facts, not every internal implementation detail.

Composition is also valid:

```js
class OrderService {
  events = new EventEmitter();
}
```

Composition makes the event surface explicit and avoids exposing every EventEmitter method on the service itself.

---

## 20. Awaiting one event with `events.once()`

The module-level `once()` is different from `emitter.once()`:

- `emitter.once()` registers a callback.
- `events.once()` returns a Promise.

```js
const { EventEmitter, once } = require("node:events");
const emitter = new EventEmitter();

setImmediate(() => {
  emitter.emit("ready", "server-1", 8080);
});

const [name, port] = await once(emitter, "ready");
console.log(name, port);
```

The Promise resolves to an array of emitted arguments. While waiting for a non-error event, an `'error'` emission rejects it. Waiting for `'error'` itself treats it as the requested normal event.

Cancel waiting with an AbortSignal:

```js
const controller = new AbortController();
const waiting = once(emitter, "ready", { signal: controller.signal });
controller.abort();

try {
  await waiting;
} catch (error) {
  if (error.name === "AbortError") console.log("Wait cancelled");
}
```

When awaiting several synchronously emitted events, create all Promises before awaiting:

```js
const waits = Promise.all([
  once(emitter, "first"),
  once(emitter, "second"),
]);

emitter.emit("first");
emitter.emit("second");

await waits;
```

If you await the first before registering for the second, a synchronous second event may be missed.

---

## 21. Consuming repeated events with `events.on()`

The module-level `on()` creates an AsyncIterator:

```js
const { EventEmitter, on } = require("node:events");
const emitter = new EventEmitter();
const controller = new AbortController();

setImmediate(() => {
  emitter.emit("message", "first");
  emitter.emit("message", "second");
  controller.abort();
});

try {
  for await (const [message] of on(emitter, "message", {
    signal: controller.signal,
  })) {
    console.log(message);
  }
} catch (error) {
  if (error.name !== "AbortError") throw error;
}
```

Each iteration value is an array of emitted arguments. The iterator throws on `'error'` and removes listeners when iteration exits. The loop processes one event at a time; `await` inside the loop does not make different iterations concurrent.

Current options include `signal`, `close` event names, and watermarks for emitters implementing `pause()` and `resume()`.

---

## 22. Node `EventTarget`

Node also exposes web-compatible global classes:

```js
const target = new EventTarget();

target.addEventListener("ready", (event) => {
  console.log(event.type);
});

target.dispatchEvent(new Event("ready"));
```

Custom payload:

```js
target.addEventListener("orderCreated", (event) => {
  console.log(event.detail);
});

target.dispatchEvent(
  new CustomEvent("orderCreated", {
    detail: { id: 101 },
  })
);
```

Node's EventTarget is based on the web API, but it has no DOM tree hierarchy, capture path, or bubbling propagation. `event.bubbles` is always false in Node.

Use EventTarget when working with web-compatible APIs, AbortSignal, or code shared with browser runtimes. Use EventEmitter for traditional Node APIs and applications built around its richer listener-management conventions.

`NodeEventTarget` is a separate modified subset and is not interchangeable with EventEmitter in most cases.

---

## 23. Browser-to-Node translation examples

### Click → order-created event

Browser:

```js
button.addEventListener("click", (event) => {
  console.log(event.type, event.target);
});
```

Node:

```js
orderEvents.on("orderCreated", (order) => {
  console.log(order.id, order.items);
});
```

### Remove a listener

Browser:

```js
button.addEventListener("click", handleClick);
button.removeEventListener("click", handleClick);
```

Node:

```js
emitter.on("message", handleMessage);
emitter.off("message", handleMessage);
```

### Trigger manually

Browser:

```js
button.dispatchEvent(new Event("click"));
// or button.click(), which invokes the element's click behavior
```

Node:

```js
emitter.emit("message", { text: "Hello" });
```

---

## 24. Real Node.js emitters

Students should see that EventEmitter is not merely a custom-demo tool.

### HTTP server

```js
const http = require("node:http");
const server = http.createServer();

server.on("request", (request, response) => {
  response.end("Hello");
});

server.on("listening", () => console.log("Server started"));
server.on("error", console.error);
server.listen(3000);
```

### Read stream

```js
const fs = require("node:fs");
const stream = fs.createReadStream("large.txt", "utf8");

stream.on("data", (chunk) => console.log(chunk.length));
stream.once("end", () => console.log("Complete"));
stream.on("error", console.error);
```

Streams and HTTP objects have their own lifecycle contracts. Always read an emitter's documentation to know which events exist and what payloads they provide.

---

## 25. Event design guidelines

### Name facts clearly

Prefer:

```text
userRegistered
orderCreated
paymentFailed
fileProcessed
```

### Document the payload

```js
// orderCreated: { orderId, userId, total, createdAt }
```

### Do not rely on return values

Listener returns are discarded. Communicate through explicit state, callbacks, Promises, or later events.

### Choose an error policy

Decide whether listener exceptions stop work, become `'error'`, are logged, or are isolated. EventEmitter does not automatically catch synchronous exceptions thrown by ordinary listeners; the exception propagates from `emit()`.

### Avoid hidden sequencing

If B must run only after A succeeds, write explicit sequential code or emit a second event after A completes.

### Make cleanup part of the design

Return an unsubscribe function when useful:

```js
function subscribeToOrders(emitter, listener) {
  emitter.on("orderCreated", listener);
  return () => emitter.off("orderCreated", listener);
}
```

---

## 26. Common mistakes

### Emitting before subscribing

EventEmitter does not store history. A later listener does not receive past events.

### Assuming `emit()` awaits async listeners

It does not. `emit()` returns a boolean immediately after calling listeners.

### Using anonymous functions that cannot be removed

Store the listener reference when cleanup is required.

### Forgetting the `'error'` listener

Unhandled error events can terminate the process.

### Raising the max listener limit without diagnosis

Warnings often expose missing cleanup.

### Expecting DOM bubbling

EventEmitter has no parent/child propagation model.

### Treating events as a durable message queue

EventEmitter is in-memory, same-process, and non-durable. Events are lost when no listener is present or the process stops.

### Overusing events

For one caller needing one result, a normal function returning a Promise is usually simpler.

---

## 27. API summary

| API | Purpose |
| --- | --- |
| `on()` / `addListener()` | Add persistent listener |
| `once()` | Add listener that runs at most once |
| `emit()` | Synchronously call listeners; return whether any existed |
| `off()` / `removeListener()` | Remove one matching registration |
| `removeAllListeners()` | Remove many listeners cautiously |
| `prependListener()` | Add at beginning |
| `prependOnceListener()` | Add one-time listener at beginning |
| `eventNames()` | List names that have listeners |
| `listenerCount()` | Count registrations |
| `listeners()` | Copy original listener functions |
| `rawListeners()` | Copy listeners including once wrappers |
| `getMaxListeners()` | Read warning threshold |
| `setMaxListeners()` | Change warning threshold |
| `events.once()` | Promise for one event |
| `events.on()` | AsyncIterator for repeated events |
| `events.getEventListeners()` | Inspect EventEmitter or EventTarget |
| `events.errorMonitor` | Observe errors without handling them |
| `events.addAbortListener()` | Safely listen for an AbortSignal abort |
| `EventEmitterAsyncResource` | Preserve async context for advanced tooling |

---

## 28. Suggested two-part teaching plan

### Session 1 — build the mental model (90 minutes)

| Time | Activity |
| --- | --- |
| 0–15 min | Browser `onclick` demonstration and vocabulary |
| 15–28 min | `addEventListener()` comparison and limitations of `onclick` |
| 28–45 min | Translate to `EventEmitter`, `on()`, `emit()`, payloads |
| 45–58 min | Synchronous order, return values, `this` |
| 58–70 min | `once()`, `off()`, cleanup, named functions |
| 70–80 min | Special `'error'` behavior |
| 80–90 min | Guided order-service exercise |

### Session 2 — production patterns (90 minutes)

| Time | Activity |
| --- | --- |
| 0–15 min | Review and prediction quiz |
| 15–30 min | Extending EventEmitter and domain events |
| 30–43 min | Async listeners and rejection capture |
| 43–55 min | Listener limits, introspection, meta-events |
| 55–68 min | Promise `once()` and AsyncIterator `on()` |
| 68–78 min | Node EventTarget versus EventEmitter |
| 78–90 min | Pair project and design review |

---

## 29. Guided classroom demonstration

```js
const { EventEmitter } = require("node:events");

class Classroom extends EventEmitter {
  startTopic(topic) {
    console.log(`Starting ${topic}`);
    this.emit("topicStarted", { topic, startedAt: Date.now() });
  }
}

const classroom = new Classroom();

function displayTopic({ topic }) {
  console.log(`Screen displays: ${topic}`);
}

classroom.on("topicStarted", displayTopic);
classroom.once("topicStarted", () => console.log("First topic of the session"));
classroom.on("error", (error) => console.error(error.message));

classroom.startTopic("Node.js Events");
classroom.startTopic("Streams");
classroom.off("topicStarted", displayTopic);
```

Ask students to predict every line and listener count before running it.

---

## 30. Review questions

1. What event-programming idea is shared by `onclick` and EventEmitter?
2. Why is `addEventListener()` a better comparison than only `onclick`?
3. What replaces the DOM element in an EventEmitter example?
4. Does EventEmitter create a standard event object automatically?
5. What does `emit()` return?
6. In what order are listeners called?
7. Does `emit()` await async listeners?
8. How does ordinary-function `this` differ from arrow-function `this`?
9. How does `once()` differ from `on()`?
10. Why must removal receive the original function reference?
11. What happens to an unhandled `'error'` event?
12. Does `errorMonitor` consume an error?
13. What does a max-listener warning mean?
14. How do `listeners()` and `rawListeners()` differ for once listeners?
15. When is `'newListener'` emitted?
16. Why should constructors usually not emit public events?
17. How does module-level `events.once()` differ from emitter `.once()`?
18. What does module-level `events.on()` return?
19. Does Node EventTarget bubble events through an object tree?
20. Why is EventEmitter not a durable cross-service message broker?

## Key takeaway

Teach the observer pattern through a familiar click, then carefully separate the APIs. Browser DOM events and Node events both connect named occurrences to listeners, but EventEmitter uses arbitrary arguments, synchronous ordered dispatch, no DOM propagation, and a special error contract. Good event-driven code documents payloads, handles errors, cleans up listeners, and uses direct Promise-based control flow when completion must be known.
