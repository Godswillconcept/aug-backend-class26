# Node.js Util Module: Deep Inspection, Async Conversion, and Helper Utilities

> Documentation basis: [official Node.js Util API](https://nodejs.org/docs/latest/api/util.html) and [Node.js Types API](https://nodejs.org/docs/latest/api/util.html#utiltypes), reviewed on 24 August 2026. This lesson covers the built-in `node:util` module, detailing object inspection, promisification, type checking, string formatting, CLI argument parsing, and deprecation management.

## Lesson overview

When building Node.js applications and backend systems, developers frequently encounter tasks that extend beyond standard JavaScript language features:
- Converting legacy callback-based functions into modern `async/await` Promises.
- Printing deeply nested objects or circular references without encountering `[Object]` truncation or runtime crashes.
- Accurately identifying complex JavaScript data types (e.g., `Promise`, `Date`, `RegExp`, `TypedArray`, `Uint8Array`) where standard `typeof` returns generic `"object"`.
- Formatting structured log strings and error messages.
- Parsing command-line arguments passed to Node.js scripts without installing heavy third-party packages.
- Managing API lifecycle deprecation warnings safely.

The built-in `node:util` module provides a comprehensive suite of utilities designed specifically to address these system-level needs.

---

## 1. Introduction to `node:util`

The `node:util` module is primarily designed to support Node.js's internal APIs, debugging workflows, and developer tools. However, many of its functions are indispensable for general application development.

### 1.1 Importing the Module

In modern Node.js code, import the module using the explicit `node:` prefix:

```js
// CommonJS syntax
const util = require("node:util");

// Or selective destructuring
const { promisify, inspect, types, parseArgs } = require("node:util");
```

---

## 2. Asynchronous Conversion: `util.promisify` and `util.callbackify`

Historically, Node.js used the **Error-First Callback Pattern** (`(err, data) => {}`). Modern Node.js code relies heavily on `Promise` objects and `async/await`. The `node:util` module provides bidirectional conversion utilities to bridge these paradigms seamlessly.

```text
                  +-------------------------------+
                  |  Legacy Callback Function     |
                  |  fs.readFile(path, cb)        |
                  +-------------------------------+
                                  |
                                  |  util.promisify()
                                  v
                  +-------------------------------+
                  |  Promise-Returning Function   |
                  |  await readFileAsync(path)    |
                  +-------------------------------+
                                  |
                                  |  util.callbackify()
                                  v
                  +-------------------------------+
                  |  Callback-Compatible Function |
                  |  callbackifiedFn(args, cb)    |
                  +-------------------------------+
```

### 2.1 `util.promisify(original)`

`util.promisify` takes a function following the standard Node.js error-first callback signature `(arg1, arg2, ..., callback)`—where `callback` is expected to be `(err, value)`—and returns a version that returns a Promise.

#### Example: Promisifying Legacy Callbacks

```js
const util = require("node:util");
const fs = require("node:fs");

// Traditional callback style
fs.readFile("student.txt", "utf-8", (err, data) => {
  if (err) {
    console.error("Read error:", err);
    return;
  }
  console.log("Callback Data:", data);
});

// Promisified style
const readFileAsync = util.promisify(fs.readFile);

async function loadStudentData() {
  try {
    const data = await readFileAsync("student.txt", "utf-8");
    console.log("Async/Await Data:", data);
  } catch (err) {
    console.error("Async Error:", err.message);
  }
}

loadStudentData();
```

#### Promisifying Custom Functions

To promisify custom functions, ensure the callback is passed as the **last parameter** and expects `(err, result)`:

```js
const util = require("node:util");

// Custom legacy function
function calculateDiscount(price, discountPercent, callback) {
  setTimeout(() => {
    if (typeof price !== "number" || typeof discountPercent !== "number") {
      return callback(new TypeError("Inputs must be numbers"));
    }
    if (price < 0 || discountPercent < 0) {
      return callback(new Error("Inputs cannot be negative"));
    }
    const finalPrice = price - (price * (discountPercent / 100));
    callback(null, finalPrice);
  }, 100);
}

// Promisify the custom function
const calculateDiscountAsync = util.promisify(calculateDiscount);

async function runCalculation() {
  const discounted = await calculateDiscountAsync(100, 20);
  console.log("Discounted price:", discounted); // 80
}

runCalculation();
```

#### Custom Promisify Symbol (`util.promisify.custom`)

If a function does not follow the error-first callback convention (for instance, returning multiple success arguments or using custom signatures), you can attach a custom promisification function using `util.promisify.custom`:

```js
const util = require("node:util");

function legacyAuth(username, password, callback) {
  // Callback takes (err, userObject, sessionToken)
  setTimeout(() => {
    if (password === "secret") {
      callback(null, { username }, "token-12345");
    } else {
      callback(new Error("Invalid credentials"));
    }
  }, 50);
}

// Attach custom promisify handler
legacyAuth[util.promisify.custom] = (username, password) => {
  return new Promise((resolve, reject) => {
    legacyAuth(username, password, (err, user, token) => {
      if (err) return reject(err);
      resolve({ user, token }); // Return object containing multiple values
    });
  });
};

const authAsync = util.promisify(legacyAuth);

async function login() {
  const result = await authAsync("admin", "secret");
  console.log("User:", result.user, "Token:", result.token);
}

login();
```

---

### 2.2 `util.callbackify(original)`

`util.callbackify` performs the inverse operation: it converts an `async` function or a function that returns a Promise into a function accepting an error-first callback `(err, value) => {}` as its last argument.

This is essential when integrating modern Promise-based libraries into legacy codebase architectures that require callback interfaces.

```js
const util = require("node:util");

// Modern async function
async function fetchUserById(userId) {
  if (userId <= 0) {
    throw new Error("Invalid User ID");
  }
  return { id: userId, name: "Alice", role: "Developer" };
}

// Convert to callback style
const fetchUserCallback = util.callbackify(fetchUserById);

// Executed via legacy callback
fetchUserCallback(42, (err, user) => {
  if (err) {
    console.error("Failed:", err.message);
    return;
  }
  console.log("Fetched User:", user.name);
});

// Handling rejection via callback
fetchUserCallback(-1, (err, user) => {
  if (err) {
    console.log("Caught expected error via callback:", err.message); // Invalid User ID
  }
});
```

---

## 3. Deep Inspection & String Formatting

### 3.1 `util.inspect(object, [options])`

`util.inspect()` returns a string representation of an `object` intended for debugging. While `console.log()` uses `util.inspect()` internally under the hood, calling `util.inspect()` directly grants fine-grained control over formatting, depth, hidden properties, and colorization.

#### Key Options for `util.inspect`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `depth` | `number \| null` | `2` | Specifies how many times to recurse while formatting objects. Pass `null` for unlimited depth. |
| `showHidden` | `boolean` | `false` | If `true`, non-enumerable symbols and properties are included. |
| `colors` | `boolean` | `false` | If `true`, output is styled with ANSI color codes for terminal display. |
| `compact` | `boolean \| number` | `3` | Controls single-line vs multi-line formatting. |
| `maxArrayLength` | `number \| null` | `100` | Limits array elements shown before truncating with `... N more items`. |
| `sorted` | `boolean \| Function` | `false` | If `true` or a comparison function, object keys are sorted. |

#### Code Example: Depth & Hidden Properties

```js
const util = require("node:util");

const complexData = {
  user: {
    profile: {
      details: {
        personal: {
          firstName: "Ada",
          lastName: "Lovelace"
        }
      }
    }
  },
  scores: [95, 88, 92, 100, 78]
};

// Define a non-enumerable property
Object.defineProperty(complexData, "internalId", {
  value: "SECRET-8849",
  enumerable: false
});

// Default inspect (depth: 2) -> truncates deep objects to [Object]
console.log("--- Default Inspect ---");
console.log(util.inspect(complexData));

// Custom inspect (unlimited depth, show hidden properties, colored output)
console.log("--- Deep & Hidden Inspect ---");
console.log(util.inspect(complexData, {
  depth: null,
  showHidden: true,
  colors: true
}));
```

#### Custom Inspection Symbol (`util.inspect.custom`)

Objects can customize their string representation when inspected by implementing a method named with the `util.inspect.custom` symbol:

```js
const util = require("node:util");

class DatabaseConnection {
  constructor(host, port, password) {
    this.host = host;
    this.port = port;
    this.password = password; // Sensitive data
    this.connectedAt = new Date();
  }

  // Custom inspection logic to mask sensitive credentials
  [util.inspect.custom](depth, options, inspect) {
    return `DatabaseConnection { host: '${this.host}:${this.port}', status: 'connected', password: '***[REDACTED]***' }`;
  }
}

const db = new DatabaseConnection("localhost", 5432, "super_secret_db_pass");
console.log(util.inspect(db));
// Output: DatabaseConnection { host: 'localhost:5432', status: 'connected', password: '***[REDACTED]***' }
```

---

### 3.2 `util.format` and `util.formatWithOptions`

`util.format()` formats strings using `printf`-like format specifiers.

#### Format Specifiers

| Specifier | Description |
| --- | --- |
| `%s` | String format |
| `%d` | Number format (integer or float) |
| `%i` | Integer format |
| `%f` | Floating point format |
| `%j` | JSON format (replaced with `[Circular]` if input has circular references) |
| `%o` | Object format (formats with `util.inspect()` showing non-enumerable properties) |
| `%O` | Object format (formats with `util.inspect()` default options) |
| `%%` | Single percent sign (`'%'`) |

#### Code Example: `util.format`

```js
const util = require("node:util");

const user = "Ada";
const count = 42;
const price = 19.995;
const payload = { role: "admin", active: true };

const msg1 = util.format("User %s has %d items costing $%f", user, count, price);
console.log(msg1);
// User Ada has 42 items costing $19.995

const msg2 = util.format("JSON payload: %j", payload);
console.log(msg2);
// JSON payload: {"role":"admin","active":true}

// Extra arguments not matching specifiers are concatenated with spaces:
const msg3 = util.format("Status:", 200, "OK", { time: "10ms" });
console.log(msg3);
// Status: 200 OK { time: '10ms' }
```

#### `util.formatWithOptions(options, format, ...args)`

Applies `util.inspect` options when formatting `%o` or `%O` specifiers:

```js
const util = require("node:util");

const data = { a: { b: { c: { d: 42 } } } };

const formatted = util.formatWithOptions(
  { depth: null, colors: true },
  "Deep inspect: %O",
  data
);

console.log(formatted);
```

---

## 4. Accurate Type Checking: `util.types`

In JavaScript, `typeof` operator has known limitations (e.g., `typeof null === "object"`, `typeof [] === "object"`, `typeof new Date() === "object"`, `typeof /abc/ === "object"`).

The `util.types` object provides reliable, native type-checking methods for complex runtime types.

### 4.1 Key Methods in `util.types`

| Method | Returns `true` if target is... |
| --- | --- |
| `util.types.isDate(value)` | A native `Date` object |
| `util.types.isRegExp(value)` | A native `RegExp` object |
| `util.types.isPromise(value)` | A native `Promise` or Thenable |
| `util.types.isAsyncFunction(value)` | An `async function` |
| `util.types.isNativeError(value)` | A native `Error` (e.g., `Error`, `TypeError`, `SyntaxError`) |
| `util.types.isAnyArrayBuffer(value)` | An `ArrayBuffer` or `SharedArrayBuffer` |
| `util.types.isMap(value)` | A native `Map` instance |
| `util.types.isSet(value)` | A native `Set` instance |
| `util.types.isTypedArray(value)` | A TypedArray (e.g. `Uint8Array`, `Int32Array`, `Float64Array`) |
| `util.types.isUint8Array(value)` | Specifically a `Uint8Array` or `Buffer` |
| `util.types.isProxy(value)` | A JavaScript `Proxy` instance |

### 4.2 Code Example: Type Verification comparison

```js
const util = require("node:util");

const values = [
  new Date(),
  /test-regex/gi,
  Promise.resolve(42),
  async function fetchData() {},
  new TypeError("Invalid argument"),
  Buffer.from("Hello"),
  new Map([["key", "val"]]),
  { key: "val" }
];

values.forEach((val, idx) => {
  console.log(`--- Item ${idx + 1} ---`);
  console.log("typeof:", typeof val);
  console.log("isDate:", util.types.isDate(val));
  console.log("isRegExp:", util.types.isRegExp(val));
  console.log("isPromise:", util.types.isPromise(val));
  console.log("isAsyncFunction:", util.types.isAsyncFunction(val));
  console.log("isNativeError:", util.types.isNativeError(val));
  console.log("isUint8Array:", util.types.isUint8Array(val));
  console.log("isMap:", util.types.isMap(val));
});
```

---

## 5. Modern CLI Argument Parsing: `util.parseArgs`

Added natively in Node.js, `util.parseArgs()` provides a built-in mechanism for parsing command-line flags (`process.argv`) without relying on external packages like `yargs` or `commander`.

### 5.1 Configuration Options

`util.parseArgs({ options, args, allowPositionals, strict })` accepts:
- `options`: Schema object defining allowed flags, types (`'string'` or `'boolean'`), short aliases, and default values.
- `args`: Array of argument strings (defaults to `process.argv.slice(2)`).
- `allowPositionals`: Boolean (`default: false`) allowing positional arguments (non-flag arguments).
- `strict`: Boolean (`default: true`) throwing an error if unknown flags are passed.

### 5.2 Code Example: CLI Argument Parser

```js
const { parseArgs } = require("node:util");

// Simulated command line arguments:
// node server.js --port=8080 -v --env production main.js
const customArgs = ["--port=8080", "-v", "--env", "production", "main.js"];

const optionsConfig = {
  port: {
    type: "string",
    short: "p",
    default: "3000"
  },
  verbose: {
    type: "boolean",
    short: "v",
    default: false
  },
  env: {
    type: "string",
    default: "development"
  }
};

const { values, positionals } = parseArgs({
  args: customArgs,
  options: optionsConfig,
  allowPositionals: true
});

console.log("Parsed Values:", values);
// { port: '8080', verbose: true, env: 'production' }

console.log("Positional Arguments:", positionals);
// [ 'main.js' ]
```

---

## 6. Deprecation Management: `util.deprecate`

When refactoring APIs or maintaining libraries, developers use `util.deprecate()` to wrap outdated functions so that calling them triggers a `DeprecationWarning` in Node.js.

### 6.1 `util.deprecate(fn, msg, [code])`

```js
const util = require("node:util");

// Legacy function to deprecate
function oldCalculateTotal(price, tax) {
  return price + tax;
}

// Wrap with deprecation notice
const calculateTotal = util.deprecate(
  oldCalculateTotal,
  "calculateTotal() is deprecated. Use calculateTotalV2({ price, tax }) instead.",
  "DEP0001" // Optional unique deprecation code
);

// Calling the function executes it normally but emits a warning to stderr
const result = calculateTotal(100, 15);
console.log("Result:", result); // 115
```

### 6.2 Node.js CLI Deprecation Flags

When executing scripts with deprecated functions, Node.js supports command-line flags to modify deprecation behavior:

- `node --trace-deprecations app.js`: Prints stack traces for deprecations.
- `node --throw-deprecations app.js`: Throws runtime exceptions on deprecations.
- `node --no-deprecation app.js`: Suppresses all deprecation warnings.

---

## 7. Text Encoding: `util.TextEncoder` and `util.TextDecoder`

`node:util` exports standard WHATWG `TextEncoder` and `TextDecoder` implementations for converting JavaScript strings to UTF-8 binary `Uint8Array` buffers and vice versa.

```js
const { TextEncoder, TextDecoder } = require("node:util");

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");

// Encode string -> Uint8Array buffer
const text = "Node.js Backend 🚀";
const encodedBuffer = encoder.encode(text);

console.log("Encoded Uint8Array:", encodedBuffer);
console.log("Byte Length:", encodedBuffer.byteLength);

// Decode Uint8Array buffer -> string
const decodedString = decoder.decode(encodedBuffer);
console.log("Decoded String:", decodedString);
```

---

## 8. Summary Table of Core `node:util` Methods

| Method | Primary Purpose | Key Benefit |
| --- | --- | --- |
| `util.promisify(fn)` | Converts error-first callbacks to Promises | Enables `async/await` syntax on legacy APIs |
| `util.callbackify(fn)` | Converts Promises/async functions to callbacks | Ensures backward compatibility with legacy consumers |
| `util.inspect(obj, opts)` | Returns formatted string representation of objects | Full control over depth, colors, hidden properties |
| `util.format(fmt, ...args)` | `printf`-style string formatting | Standardized string assembly with type specifiers |
| `util.types.*` | Native type checkers (`isDate`, `isPromise`, etc.) | Accurate identification where `typeof` fails |
| `util.parseArgs(config)` | Native CLI flag & positional argument parser | Lightweight CLI parameter handling without dependencies |
| `util.deprecate(fn, msg)` | Wraps functions with deprecation warnings | Controlled API migration with standard Node warnings |
| `util.TextEncoder/Decoder` | WHATWG text encoding/decoding | Standardized UTF-8 binary buffer conversions |

---

## 9. Next Steps

- Practice converting legacy asynchronous patterns in `exercises/07-util-module-exercises.md`.
- Experiment with `util.inspect` and custom inspect symbols on complex application objects.
- Build a CLI runner using native `util.parseArgs`.
