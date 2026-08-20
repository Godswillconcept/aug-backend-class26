# Student Exercises: Node.js `events` Module

> Aligned with the [official Node.js Events documentation](https://nodejs.org/docs/latest/api/events.html), reviewed on 11 August 2026. Browser comparisons use the standard `EventTarget`/`addEventListener()` model.

## Instructions

- Use CommonJS unless instructed otherwise.
- Predict output before running each program.
- Add an `'error'` listener to every custom emitter that can emit errors.
- Store listener references when cleanup is required.
- Do not solve ordered business steps with unrelated listeners when direct sequential code is clearer.

---

## Part A — Browser-to-Node bridge

### Exercise 1: Label the browser event parts

For this code, identify target, event type, listener, event object, and trigger:

```js
button.addEventListener("click", function handleClick(event) {
  console.log(event.type);
});

button.click();
```

### Exercise 2: Translate to EventEmitter

Translate Exercise 1 into Node.js with:

- an EventEmitter named `buttonEvents`;
- event name `click`;
- listener `handleClick`;
- a payload `{ source: "manual" }`;
- an `emit()` call.

State which browser concepts do not transfer automatically.

### Exercise 3: `onclick` versus subscriptions

Explain the result:

```js
button.onclick = firstHandler;
button.onclick = secondHandler;
```

Compare it with two calls to `addEventListener()` and two calls to `emitter.on()`.

### Exercise 4: Comparison table

Complete this table without looking at the lecture summary:

| Concern | DOM `EventTarget` | Node `EventEmitter` |
| --- | --- | --- |
| Subscribe | ? | ? |
| Trigger | ? | ? |
| Remove | ? | ? |
| Once | ? | ? |
| Data | ? | ? |
| Propagation | ? | ? |
| Unhandled `error` | ? | ? |

---

## Part B — Core EventEmitter behavior

### Exercise 5: First emitter

Create an emitter, subscribe to `courseStarted`, and emit:

```js
{
  title: "Node.js Backend",
  students: 20
}
```

The listener should print a readable sentence.

### Exercise 6: Multiple arguments

Register a `paymentCompleted` listener receiving `paymentId`, `amount`, and `currency`. Emit valid values and print them as an object.

Rewrite it using one payload object. Which is easier to extend?

### Exercise 7: Predict order

Predict exact output:

```js
const emitter = new EventEmitter();

emitter.on("run", () => console.log("A"));
emitter.on("run", () => console.log("B"));

console.log("before");
const result = emitter.emit("run");
console.log("after", result);
console.log("missing", emitter.emit("missing"));
```

### Exercise 8: Return values

Create two listeners returning `10` and `20`. Show that `emit()` does not return either listener value. Explain how a caller should request and await a calculated result instead.

### Exercise 9: Listener `this`

Register one ordinary function and one arrow function for the same event. Compare each listener's `this` with the emitter. Explain the result without assuming that top-level arrow `this` is identical in every module system.

### Exercise 10: Duplicate registration

Register the same function three times for one event. Emit once, inspect `listenerCount()`, remove it once, emit again, then remove it twice. Record counts and calls at each stage.

---

## Part C — Once, removal, and order

### Exercise 11: One-time initialization

Use `once()` so an initialization listener runs only for the first `connected` emission while a normal status listener runs for all three emissions.

### Exercise 12: Anonymous removal bug

Explain why this fails and correct it:

```js
emitter.on("status", () => console.log("changed"));
emitter.off("status", () => console.log("changed"));
```

### Exercise 13: Unsubscribe helper

Write:

```js
function subscribe(emitter, eventName, listener) {
  // subscribe and return an unsubscribe function
}
```

Test that the listener stops after calling the returned function.

### Exercise 14: Prepend listeners

Register `normalA`, `normalB`, `firstEveryTime`, and `firstOnlyOnce` using the appropriate normal/prepend methods. Predict the order for the first and second emissions.

### Exercise 15: Remove during emission

Listener A removes listener B while event `work` is being emitted. Demonstrate that B still runs during the current emission but not the next one. Explain why.

---

## Part D — Errors and asynchronous listeners

### Exercise 16: Safe error handling

Create a `FileProcessor` emitter with a `process(fileName)` method. It should:

- emit `processed` for `.txt` files;
- emit `'error'` with an Error for other extensions;
- never crash during the test because a normal error listener is installed first.

### Exercise 17: Observe without consuming

Install both `errorMonitor` and a normal `'error'` listener. Emit an error and record ordering. Then explain what would happen if only `errorMonitor` remained.

### Exercise 18: Synchronous listener exception

One normal listener throws an exception. Wrap `emit()` in `try...catch` and determine whether later listeners run. Distinguish this from Node EventTarget's documented handler-error behavior.

### Exercise 19: Async misconception

Predict the order:

```js
emitter.on("save", async () => {
  console.log("listener start");
  await Promise.resolve();
  console.log("listener end");
});

console.log("before");
emitter.emit("save");
console.log("after");
```

Why does `emit()` not tell the publisher when saving finishes?

### Exercise 20: Capture rejection

Create an EventEmitter with `captureRejections: true`. Add an async listener that throws and a synchronous `'error'` listener. Verify the rejection reaches the error listener.

---

## Part E — Inspection and Promise integration

### Exercise 21: Inspect an emitter

Register two string-named events and one Symbol-named event. Print:

- `eventNames()`;
- listener count for each;
- `listeners()` for a persistent event;
- `listeners()` and `rawListeners()` for a once event;
- maximum listener value.

### Exercise 22: Diagnose a warning

Design a minimal program that intentionally adds 11 listeners to one event and produces a warning under the default configuration. Do not “solve” it by raising the limit. Explain two realistic bugs that produce this warning.

### Exercise 23: Await one event

Use module-level `events.once()` to await `ready`, emitted later with name and port arguments. Destructure the resolved array.

### Exercise 24: Error while awaiting

Wait for `ready`, then emit `'error'` instead. Catch the rejected Promise. Next, explicitly wait for `'error'` and show that it resolves normally with the Error in the arguments array.

### Exercise 25: Abort a wait

Use an AbortController to cancel `events.once(emitter, "ready", { signal })`. Verify the caught error name.

### Exercise 26: Consume repeated events

Use module-level `events.on()` and `for await...of` to consume three `message` events. Stop safely with an AbortController. Remember that each iteration produces an argument array.

### Exercise 27: Multiple synchronous events

Demonstrate the wrong and correct way to await `first` and `second` when both can be emitted synchronously in the same turn. Explain why both Promise listeners must be created first.

---

## Part F — EventTarget and backend design

### Exercise 28: Node EventTarget

Create a global Node `EventTarget`. Register two `ready` listeners and dispatch `new Event("ready")`. Then dispatch a `CustomEvent("userCreated", { detail: user })` and read `event.detail`.

List three differences from EventEmitter and one difference from hierarchical browser DOM events.

### Exercise 29: Order service

Create an `OrderService extends EventEmitter` with:

```js
createOrder({ userId, items })
cancelOrder(orderId, reason)
```

Events:

- `orderCreated` with one immutable-style payload object;
- `orderCancelled` with order ID, reason, and timestamp;
- `'error'` for invalid input.

Listeners should simulate receipts, analytics, audit logging, and inventory notification. Include cleanup for at least one listener and tests with `node:assert/strict`.

### Exercise 30: Choose events or direct calls

For each scenario, choose EventEmitter, EventTarget, direct Promise-returning function, or durable message broker. Justify each:

1. The caller must receive a database result or failure.
2. Several in-process modules react after a user is registered.
3. Browser-compatible code reacts to AbortSignal.
4. A payment event must survive service restarts and reach another service.
5. A stream announces chunks and completion.
6. Step B must run only if asynchronous Step A succeeds.

---

## Pair project: Event-driven job processor

Build:

```text
job-processor.js
job-processor.test.js
```

The `JobProcessor` must extend EventEmitter and provide:

```js
addJob(job)
start()
stop()
```

Events:

```text
jobQueued       { jobId, type, queuedAt }
jobStarted      { jobId, startedAt }
jobProgress     { jobId, percent }
jobCompleted    { jobId, result, completedAt }
jobFailed       { jobId, error, failedAt }
idle            no payload
error           Error object for processor-level failures
```

Requirements:

- Validate jobs and generate stable unique IDs.
- Process jobs sequentially so event order is deterministic.
- Use one payload object per domain event.
- Install error handling before work starts.
- Do not emit public lifecycle events from the constructor.
- Ensure progress is between 0 and 100.
- Make `start()` and `stop()` safe to call repeatedly.
- Use `once()` for the first idle event in one test.
- Use module-level `events.once()` to await a completion in another test.
- Test listener cleanup and the no-listener return from `emit()`.
- Explain why this is not a durable cross-process queue.

### Marking guide — 30 marks

| Area | Marks |
| --- | ---: |
| EventEmitter class design | 4 |
| Event names and payload contracts | 4 |
| Deterministic job lifecycle | 5 |
| Error handling | 4 |
| Listener lifecycle and cleanup | 4 |
| Promise/event integration | 3 |
| Automated tests | 5 |
| Explanation and readability | 1 |

---

## Exit ticket

1. What is the browser equivalent of `on()`?
2. What does `emit()` return?
3. Are EventEmitter listeners invoked synchronously or automatically awaited?
4. How do `on()` and `once()` differ?
5. Why is the original function reference needed by `off()`?
6. What happens when `'error'` has no listener?
7. Does `errorMonitor` handle the error?
8. What does a max-listener warning usually suggest?
9. What does module-level `events.once()` return?
10. Does EventEmitter support DOM bubbling?
