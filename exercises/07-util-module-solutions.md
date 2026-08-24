# Instructor Guide and Solutions: Node.js `util` Module

> Based on the [official Node.js Util documentation](https://nodejs.org/docs/latest/api/util.html), reviewed on 24 August 2026. Keep this guide separate during assessed exercises.

Unless otherwise shown:

```js
const util = require("node:util");
const assert = require("node:assert/strict");
```

---

## Part A Solutions — Conceptual & API Understanding

### Exercise 1 Solution

1. **Expected Function Signature:**
   `util.promisify()` expects an error-first callback function as the final parameter: `(arg1, arg2, ..., callback)`, where `callback` has signature `(err, value) => {}`.

2. **Callback Handling (`null` vs `err`):**
   - If `callback(null, result)` is called, the returned Promise **resolves** with `result`.
   - If `callback(err)` is called with a truthy error instance, the returned Promise **rejects** with `err`.

3. **Multiple Success Arguments:**
   - Standard `util.promisify()` ignores additional callback parameters beyond the first success value (only returning `val1`).
   - To resolve multiple values, define a custom promisify implementation attached to `fn[util.promisify.custom]` that returns a Promise resolving to an object or array containing all values.

---

### Exercise 2 Solution

| Expression / Input | `typeof input === "object"` | `util.types.isDate(input)` | `util.types.isPromise(input)` | `util.types.isNativeError(input)` |
| --- | --- | --- | --- | --- |
| `new Date()` | `true` | `true` | `false` | `false` |
| `Promise.resolve(10)` | `true` | `false` | `true` | `false` |
| `new TypeError("Bad input")` | `true` | `false` | `false` | `true` |
| `{ name: "Alice" }` | `true` | `false` | `false` | `false` |

---

### Exercise 3 Solution

1. **`util.inspect()` Options Required:**
   ```js
   util.inspect(obj, {
     showHidden: true, // Show non-enumerable symbols/properties
     depth: null,      // Unlimited recursion depth
     colors: true      // Enable ANSI colors for terminal display
   });
   ```

2. **Resulting Formatted String:**
   `"User Ada logged in with ID 101 ({"status":"active"})"`

---

## Part B Solutions — Asynchronous Conversion & Callback Interoperability

### Exercise 4 Solution: Promisify Legacy Callback Functions

```js
const util = require("node:util");
const assert = require("node:assert/strict");

// 1. Custom legacy error-first callback function
function fetchDatabaseRecord(id, callback) {
  setTimeout(() => {
    if (typeof id !== "number" || id <= 0) {
      return callback(new Error("Invalid ID"));
    }
    callback(null, { id, recordName: `Record #${id}` });
  }, 50);
}

// 2. Promisify the function
const fetchDatabaseRecordAsync = util.promisify(fetchDatabaseRecord);

async function testPromisify() {
  // Test valid ID
  const result = await fetchDatabaseRecordAsync(5);
  assert.equal(result.id, 5);
  assert.equal(result.recordName, "Record #5");

  // Test invalid ID rejection
  await assert.rejects(
    async () => {
      await fetchDatabaseRecordAsync(-2);
    },
    {
      name: "Error",
      message: "Invalid ID"
    }
  );

  console.log("Exercise 4 Solution passed cleanly.");
}

testPromisify();
```

---

### Exercise 5 Solution: Custom Promisification Symbol Implementation

```js
const util = require("node:util");
const assert = require("node:assert/strict");

// Legacy function with multiple success callback arguments
function calculateStats(numbers, callback) {
  setTimeout(() => {
    if (!Array.isArray(numbers) || numbers.length === 0) {
      return callback(new Error("Input must be a non-empty array"));
    }
    const sum = numbers.reduce((acc, n) => acc + n, 0);
    const mean = sum / numbers.length;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    // Returns TWO success values to callback
    callback(null, mean, median);
  }, 50);
}

// Attach custom promisify handler
calculateStats[util.promisify.custom] = (numbers) => {
  return new Promise((resolve, reject) => {
    calculateStats(numbers, (err, mean, median) => {
      if (err) return reject(err);
      resolve({ mean, median });
    });
  });
};

const calculateStatsAsync = util.promisify(calculateStats);

async function testCustomPromisify() {
  const stats = await calculateStatsAsync([10, 20, 30, 40, 50]);
  
  assert.equal(stats.mean, 30);
  assert.equal(stats.median, 30);

  console.log("Exercise 5 Solution passed cleanly.");
}

testCustomPromisify();
```

---

### Exercise 6 Solution: Interoperability with `util.callbackify`

```js
const util = require("node:util");
const assert = require("node:assert/strict");

// Modern async function
async function computeHash(text) {
  if (typeof text !== "string") {
    throw new TypeError("Input must be a string");
  }
  return text.toUpperCase();
}

// Convert async function to error-first callback style
const computeHashCb = util.callbackify(computeHash);

// Test success case
computeHashCb("hello node", (err, result) => {
  assert.equal(err, null);
  assert.equal(result, "HELLO NODE");

  // Test error case
  computeHashCb(12345, (err, result) => {
    assert.ok(err instanceof TypeError);
    assert.equal(err.message, "Input must be a string");
    assert.equal(result, undefined);

    console.log("Exercise 6 Solution passed cleanly.");
  });
});
```

---

## Part C Solutions — Inspection, Formatting & Type Checking

### Exercise 7 Solution: Custom Inspect Symbol for Sensitive Data

```js
const util = require("node:util");
const assert = require("node:assert/strict");

class UserAccount {
  constructor(username, email, apiKey) {
    this.username = username;
    this.email = email;
    this.apiKey = apiKey;
  }

  // Custom inspection logic using util.inspect.custom
  [util.inspect.custom](depth, options, inspect) {
    return `UserAccount { username: '${this.username}', email: '${this.email}', apiKey: '***REDACTED***' }`;
  }
}

const account = new UserAccount("ada_lovelace", "ada@example.com", "secret_api_key_998877");
const inspectedOutput = util.inspect(account);

console.log("Inspected Output:\n", inspectedOutput);

// Assertions
assert.ok(inspectedOutput.includes("***REDACTED***"));
assert.ok(!inspectedOutput.includes("secret_api_key_998877"));

console.log("Exercise 7 Solution passed cleanly.");
```

---

### Exercise 8 Solution: Strict Runtime Type Validator

```js
const util = require("node:util");
const assert = require("node:assert/strict");

function validatePayload(payload) {
  if (!payload || typeof payload !== "object") return false;

  const isDateValid = util.types.isDate(payload.createdAt);
  const isRegExpValid = util.types.isRegExp(payload.queryPattern);
  const isAsyncValid = util.types.isAsyncFunction(payload.asyncTask);
  const isBufferValid = util.types.isUint8Array(payload.bufferData);

  return isDateValid && isRegExpValid && isAsyncValid && isBufferValid;
}

// Test cases
const validPayload = {
  createdAt: new Date(),
  queryPattern: /^[a-z]+$/i,
  asyncTask: async function execute() {},
  bufferData: Buffer.from("test")
};

const invalidPayload = {
  createdAt: "2026-08-24", // String, not Date object
  queryPattern: "/^[a-z]+$/i", // String, not RegExp object
  asyncTask: function execute() {}, // Standard function, not AsyncFunction
  bufferData: [1, 2, 3] // Array, not Uint8Array/Buffer
};

assert.equal(validatePayload(validPayload), true);
assert.equal(validatePayload(invalidPayload), false);

console.log("Exercise 8 Solution passed cleanly.");
```

---

## Part D Solutions — Advanced Utilities & CLI Argument Parsing

### Exercise 9 Solution: Native CLI Argument Parser with `util.parseArgs`

```js
const { parseArgs } = require("node:util");
const assert = require("node:assert/strict");

const customArgs = ["-p", "4000", "--debug", "--host=localhost", "app.js", "config.json"];

const optionsConfig = {
  port: {
    type: "string",
    short: "p",
    default: "8080"
  },
  host: {
    type: "string",
    short: "h",
    default: "127.0.0.1"
  },
  debug: {
    type: "boolean",
    short: "d",
    default: false
  }
};

const { values, positionals } = parseArgs({
  args: customArgs,
  options: optionsConfig,
  allowPositionals: true
});

// Assertions
assert.equal(values.port, "4000");
assert.equal(values.host, "localhost");
assert.equal(values.debug, true);
assert.deepEqual(positionals, ["app.js", "config.json"]);

console.log("Exercise 9 Solution passed cleanly.");
console.log("Values:", values);
console.log("Positionals:", positionals);
```

---

### Exercise 10 Solution: API Deprecation Notice Wrapper

```js
const util = require("node:util");
const assert = require("node:assert/strict");

function oldMultiply(a, b) {
  return a * b;
}

// Deprecate the legacy function
const multiply = util.deprecate(
  oldMultiply,
  "multiply() is deprecated. Use math.multiply() instead.",
  "DEP_MATH_01"
);

// Execution
const result = multiply(4, 5);

// Assertion
assert.equal(result, 20);

console.log("Exercise 10 Solution passed cleanly. Result:", result);
```
