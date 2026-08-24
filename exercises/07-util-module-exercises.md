# Student Exercises: Node.js `util` Module

> Use the built-in `node:util` module as described in the [official Node.js Util documentation](https://nodejs.org/docs/latest/api/util.html). Do not use external third-party libraries for these exercises.

## Instructions

- Use CommonJS (`require("node:util")`).
- Predict outputs and behavior before running your scripts.
- Leverage previous module knowledge: Module 01 (`path`), Module 02 (`fs`), Module 04 (`events`), Module 05 (`url`), Module 06 (`http`).
- Use Node’s built-in `node:assert/strict` module for automated assertions and verification tests where applicable.
- Handle error-first callbacks, Promises, and custom inspect symbols accurately.

---

## Part A — Conceptual & API Understanding

### Exercise 1: Error-First Callback vs Promisify Mechanics

1. What specific function signature does `util.promisify()` expect by default for the target function and its callback argument?
2. Explain what happens if a callback passes `callback(null, result)` versus `callback(err)`.
3. If a legacy callback function passes *multiple* success arguments to its callback (e.g., `callback(null, val1, val2)`), how does standard `util.promisify()` handle the result? What mechanism should be used to resolve this?

### Exercise 2: `typeof` Limitations vs `util.types`

Fill in the expected return value (`true` or `false`) for both standard `typeof` comparisons and `util.types` methods in the table below:

| Expression / Input | `typeof input === "object"` | `util.types.isDate(input)` | `util.types.isPromise(input)` | `util.types.isNativeError(input)` |
| --- | --- | --- | --- | --- |
| `new Date()` | | | | |
| `Promise.resolve(10)` | | | | |
| `new TypeError("Bad input")` | | | | |
| `{ name: "Alice" }` | | | | |

### Exercise 3: Inspect Options & Format Specifiers

1. List the `util.inspect()` option flags needed to display non-enumerable properties, print nested objects without depth truncation, and add ANSI terminal colors.
2. Given `util.format("User %s logged in with ID %d (%j)", "Ada", 101, { status: "active" })`, write out the resulting formatted string.

---

## Part B — Asynchronous Conversion & Callback Interoperability

### Exercise 4: Promisify Legacy Callback Functions

Write a program `promisify-test.js` that:
1. Imports `node:util` and `node:fs`.
2. Creates a custom callback-based function `fetchDatabaseRecord(id, callback)` that:
   - Delays response by `50ms` using `setTimeout`.
   - If `id <= 0`, calls `callback(new Error("Invalid ID"))`.
   - If `id > 0`, calls `callback(null, { id, recordName: `Record #${id}` })`.
3. Promisifies `fetchDatabaseRecord` using `util.promisify()`.
4. Executes the promisified function inside an `async/await` try/catch block for both valid (`id = 5`) and invalid (`id = -2`) inputs.
5. Verifies results using `node:assert/strict`.

### Exercise 5: Custom Promisification Symbol Implementation

Write a script `custom-promisify.js` that:
1. Defines a function `calculateStats(numbers, callback)` where `callback` expects `(err, mean, median)` (multiple success values).
2. Attaches a custom promisification handler to `calculateStats[util.promisify.custom]` that returns a Promise resolving to an object: `{ mean, median }`.
3. Converts `calculateStats` using `util.promisify`.
4. Calls the promisified function with array `[10, 20, 30, 40, 50]` and asserts using `node:assert/strict` that:
   - `mean` equals `30`.
   - `median` equals `30`.

### Exercise 6: Interoperability with `util.callbackify`

Write a script `callbackify-test.js` that:
1. Defines an `async` function `computeHash(text)` that returns a Promise resolving to the uppercase string `text.toUpperCase()`. If `text` is not a string, it throws a `TypeError("Input must be a string")`.
2. Converts `computeHash` into a callback-style function `computeHashCb` using `util.callbackify()`.
3. Calls `computeHashCb("hello node", (err, result) => ...)` and asserts `result === "HELLO NODE"`.
4. Calls `computeHashCb(12345, (err, result) => ...)` and asserts `err instanceof TypeError`.

---

## Part C — Inspection, Formatting & Type Checking

### Exercise 7: Custom Inspect Symbol for Sensitive Data

Write a class `UserAccount` in `custom-inspect.js` that:
1. Accepts `username`, `email`, and `apiKey` in its constructor.
2. Implements the `util.inspect.custom` symbol method.
3. Formats inspection output so that `apiKey` is always masked as `"***REDACTED***"`.
4. Test inspecting the instance using `util.inspect(account)` and verify via `node:assert/strict` that the output string contains `"***REDACTED***"` and does NOT reveal the raw API key.

### Exercise 8: Strict Runtime Type Validator

Write a utility function `validatePayload(payload)` in `type-validator.js` that uses `util.types` to inspect an input object:
1. Returns `true` if `payload` satisfies ALL of the following criteria:
   - `payload.createdAt` is a valid `Date` object (`util.types.isDate`).
   - `payload.queryPattern` is a `RegExp` object (`util.types.isRegExp`).
   - `payload.asyncTask` is an `AsyncFunction` (`util.types.isAsyncFunction`).
   - `payload.bufferData` is a `Uint8Array` or `Buffer` (`util.types.isUint8Array`).
2. Otherwise returns `false`.
3. Add `node:assert/strict` test cases covering valid and invalid payload objects.

---

## Part D — Advanced Utilities & CLI Argument Parsing

### Exercise 9: Native CLI Argument Parser with `util.parseArgs`

Write a script `cli-parser.js` that uses `util.parseArgs()` to parse command-line flags for a server runner tool:
1. Configure options schema:
   - `--port` / `-p`: string option, default `"8080"`.
   - `--host` / `-h`: string option, default `"127.0.0.1"`.
   - `--debug` / `-d`: boolean option, default `false`.
   - Enable `allowPositionals: true`.
2. Test the parser against custom argument array: `["-p", "4000", "--debug", "--host=localhost", "app.js", "config.json"]`.
3. Verify using `node:assert/strict` that:
   - `values.port === "4000"`.
   - `values.host === "localhost"`.
   - `values.debug === true`.
   - `positionals` equals `["app.js", "config.json"]`.

### Exercise 10: API Deprecation Notice Wrapper

Write a script `deprecation-test.js` that:
1. Creates a legacy helper function `multiply(a, b)` returning `a * b`.
2. Wraps `multiply` using `util.deprecate()` with message `"multiply() is deprecated. Use math.multiply() instead."` and code `"DEP_MATH_01"`.
3. Executes the deprecated function and verifies that it still correctly returns `20` when passed `4` and `5`.
