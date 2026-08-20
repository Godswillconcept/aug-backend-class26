# Student Exercises: Node.js `path` Module

> Aligned with the [official Node.js `path` API documentation](https://nodejs.org/docs/latest/api/path.html), reviewed on 5 August 2026. Exercises using `path.matchesGlob()` require Node.js v20.17.0+ or v22.5.0+; the API became stable in v22.20.0 and v24.8.0.

## Instructions

- Use CommonJS and import the module with `require("node:path")`.
- Run each file with `node filename.js`.
- Do not use hard-coded `/` or `\` separators unless an exercise specifically asks you to analyze platform syntax.
- Predict the output before running the code.
- Some displayed paths will differ between Windows and POSIX systems.

---

## Part A — Quick checks

### Exercise 1: Identify the path type

For each path, state whether it is absolute or relative. Also identify whether it uses Windows or POSIX syntax.

```text
/home/student/app/index.js
src/controllers/user.js
C:\Users\Student\app.js
../config/database.js
./public/index.html
\\server\shared\report.pdf
```

Then confirm appropriate examples with `path.posix.isAbsolute()` or `path.win32.isAbsolute()`.

### Exercise 2: Predict `extname()`

Predict each result before running it:

```js
path.extname("index.js");
path.extname("archive.tar.gz");
path.extname("README");
path.extname(".env");
path.extname("photo.JPG");
path.extname("file.");
```

Explain why `archive.tar.gz` and `.env` give different-looking results.

### Exercise 3: `sep` versus `delimiter`

Print `path.sep` and `path.delimiter`. In one sentence each, explain what they separate.

---

## Part B — Guided coding

### Exercise 4: Build a course-material path

Create a path from the current module directory to this imaginary file:

```text
materials/week-02/express-introduction.md
```

Print:

1. the complete path;
2. its directory;
3. its base name;
4. its extension;
5. its base name without the extension;
6. whether it is absolute.

Required APIs: `join`, `dirname`, `basename`, `extname`, and `isAbsolute`.

### Exercise 5: Compare `join()` and `resolve()`

Create these two values:

```js
const joined = /* join "uploads", "images", and "avatar.png" */;
const resolved = /* resolve the same segments */;
```

Print both and answer:

1. Which result is absolute?
2. Which one depends on `process.cwd()`?
3. What happens if the program is launched from a different directory?

### Exercise 6: Parse and rename

Given:

```js
const original = "/reports/2026/august-sales.csv";
```

Use `path.posix.parse()` to inspect it. Then use `path.posix.format()` to create:

```text
/reports/2026/august-sales-backup.csv
```

Do not build the final string through concatenation.

### Exercise 7: Normalize messy input

Normalize this path:

```text
users//student/./projects/node/../express/app.js
```

Before running the code, write the POSIX result you expect. Explain what happened to:

- the double separator;
- `.`;
- `node/..`.

### Exercise 8: Find a relative route

Using POSIX path rules, find the relative path from:

```text
/school/backend/src/controllers
```

to:

```text
/school/backend/public/images/logo.png
```

Use `path.posix.relative()` and explain each `..` in the result.

---

## Part C — Applied backend exercises

### Exercise 9: Upload destination helper

Write a function:

```js
function getUploadPath(userId, fileName) {
  // your code
}
```

It must return an absolute path shaped like:

```text
<project-working-directory>/uploads/<userId>/<fileName>
```

Requirements:

- convert `userId` to a string;
- use a `path` method instead of string concatenation;
- demonstrate it with user ID `42` and file name `avatar.png`;
- explain whether the function actually creates the file or directory.

### Exercise 10: File information helper

Write a function named `getFileInfo(filePath)` that returns:

```js
{
  absolutePath: "...",
  directory: "...",
  fileName: "...",
  nameWithoutExtension: "...",
  extension: "...",
  isAbsolute: true
}
```

Rules:

- Resolve relative inputs against the current working directory.
- Return the extension in lowercase.
- Use `path.parse()` at least once.
- Test it with `./uploads/REPORT.Final.PDF`.

### Exercise 11: Extension allowlist

Write a function named `isAllowedImage(fileName)` that returns `true` only for these extensions:

```text
.jpg, .jpeg, .png, .gif, .webp
```

It must work for upper- and lowercase extensions.

Test these values:

```text
profile.JPG
banner.png
animation.GiF
notes.txt
fake.jpg.exe
.jpg
```

Discuss why this function is useful but cannot prove that a file really is an image.

### Exercise 12: Generate unique-looking upload names

Write a function:

```js
function createStoredName(originalName, id) {
  // your code
}
```

Examples:

```text
createStoredName("holiday.photo.JPG", "abc123") -> abc123.JPG
createStoredName("README", "doc9")             -> doc9
```

Use `path.extname()`. Preserve the original extension's letter case.

### Exercise 13: Safe public-file resolver

Write:

```js
function resolvePublicFile(publicDirectory, requestedPath) {
  // your code
}
```

The function must:

1. return an absolute candidate path when it stays inside `publicDirectory`;
2. throw an error when it escapes the directory;
3. reject both the direct parent (`..`) and deeper parent paths (`../...`);
4. account for unrelated absolute paths or Windows drive differences.

Test at least:

```text
images/logo.png       -> accept
css/main.css          -> accept
../private.txt        -> reject
images/../../.env     -> reject
```

Explain why `candidate.startsWith(base)` is not a safe replacement.

### Exercise 14: Environment `PATH` viewer

Write a script that:

1. gets `process.env.PATH` without crashing if it is missing;
2. splits it with the correct platform delimiter;
3. prints one entry per line with its index;
4. prints how many entries are absolute paths.

---

## Part D — Debugging challenges

### Exercise 15: Wrong separator

Explain the portability problem and correct it:

```js
const logFile = __dirname + "\\logs\\application.log";
```

### Exercise 16: Wrong assumption about the working directory

This program sometimes cannot find its template when launched from another folder:

```js
const templatePath = path.resolve("templates", "welcome.html");
```

Assume `templates` is beside the current JavaScript file. Correct the code and explain why the original result changed.

### Exercise 17: Incorrect extension check

Find and fix all problems:

```js
function isPdf(fileName) {
  return path.extname(fileName) === "pdf";
}
```

The corrected function must accept `REPORT.PDF`.

### Exercise 18: `format()` precedence

Predict the result and explain which fields are ignored:

```js
const result = path.posix.format({
  root: "/",
  dir: "/exports",
  base: "final.json",
  name: "draft",
  ext: ".txt",
});
```

Also predict this result on Node.js v19.0.0 or newer:

```js
path.posix.format({ root: "/", name: "report", ext: "pdf" });
```

---

## Part E — Pair project

### Exercise 19: Static-file path utility

In pairs, build `static-path.js` that exports:

```js
getPublicRoot()
resolveAsset(requestedPath)
getAssetInfo(requestedPath)
isSupportedAsset(requestedPath)
```

Requirements:

- `getPublicRoot()` returns an absolute `public` directory beside the module.
- `resolveAsset()` returns a path inside that root and rejects traversal.
- `getAssetInfo()` returns `dir`, `base`, `name`, and lowercase `ext`.
- `isSupportedAsset()` accepts `.html`, `.css`, `.js`, `.png`, `.jpg`, and `.svg`.
- Export all four functions with CommonJS.
- Create `static-path.test.js` using `node:assert/strict`.
- Include at least six successful assertions and four rejection assertions.

Suggested assertion:

```js
const assert = require("node:assert/strict");

assert.equal(isSupportedAsset("styles/main.CSS"), true);
assert.throws(() => resolveAsset("../../secret.txt"));
```

### Pair-project marking guide — 20 marks

| Area | Marks |
| --- | ---: |
| Correct use of `path` APIs | 5 |
| Cross-platform construction | 3 |
| Traversal protection | 5 |
| Exports and code organization | 2 |
| Tests and edge cases | 4 |
| Explanation/readability | 1 |

---

## Part F — Official-documentation edge cases

### Exercise 20: Match path strings with `matchesGlob()`

First check whether your installed Node.js version supports the method:

```js
console.log(process.version);
console.log(typeof path.matchesGlob);
```

If supported, write `isJavaScriptSource(filePath)` using `path.matchesGlob()`. It should match JavaScript files anywhere under `src` and reject other extensions or top-level directories.

Test:

```text
src/app.js                    -> true
src/controllers/user.js       -> true
src/controllers/user.test.js  -> true
public/app.js                 -> false
src/styles/main.css           -> false
```

Then answer:

1. Does `matchesGlob()` check whether the file exists?
2. Which Node.js versions first introduced the method?
3. Which versions first marked it stable?

### Exercise 21: Documented empty-string behavior

Predict and then test:

```js
path.join("");
path.normalize("");
path.resolve();
path.isAbsolute("");
path.relative("", "");
```

Explain why the answers are not all the same and identify which methods use the current working directory.

### Exercise 22: Trailing separators

Using `path.posix`, predict and test:

```js
path.posix.basename("/courses/node/");
path.posix.dirname("/courses/node/");
path.posix.parse("/courses/node/");
path.posix.normalize("/courses/node//");
path.posix.resolve("/courses/node/");
```

Classify which methods ignore, preserve, or remove trailing separators.

### Exercise 23: Windows drive-relative paths

Explain why these expressions can produce different results on Windows:

```js
path.resolve('C:');
path.resolve('C:\\');
```

Which form explicitly represents the root of drive C? Why should backend applications avoid ambiguous drive-relative paths?

### Exercise 24: `toNamespacedPath()` investigation

Write a script that calls `path.toNamespacedPath()` with an absolute path and prints the result.

Answer:

1. On which operating system is this method meaningful?
2. What happens on POSIX?
3. Is it normally needed for everyday path construction?
4. What unusual behavior does the official documentation describe for a non-string argument?

---

## Exit ticket

Answer without running code:

1. Which method would you use to combine path pieces?
2. Which method always produces an absolute path?
3. Which method returns `.js` from `server.js`?
4. What is the difference between `__dirname` and `process.cwd()`?
5. Does normalization guarantee that a user-controlled path is safe?
