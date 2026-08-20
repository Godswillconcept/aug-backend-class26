# Instructor Guide and Solutions: Node.js `path` Module

> Aligned with the [official Node.js `path` API documentation](https://nodejs.org/docs/latest/api/path.html), reviewed on 5 August 2026. The current latest documentation reports Node.js v26.6.0.

> Keep this file separate from the student worksheet if exercises will be assessed. Outputs containing separators or absolute directories vary by machine.

## Part A solutions

### Exercise 1

| Path | Type | Style |
| --- | --- | --- |
| `/home/student/app/index.js` | Absolute | POSIX |
| `src/controllers/user.js` | Relative | POSIX-style separators |
| `C:\Users\Student\app.js` | Absolute | Windows |
| `../config/database.js` | Relative | POSIX-style separators |
| `./public/index.html` | Relative | POSIX-style separators |
| `\\server\shared\report.pdf` | Absolute UNC path | Windows |

```js
const path = require("node:path");

console.log(path.posix.isAbsolute("/home/student/app/index.js"));
console.log(path.win32.isAbsolute("C:\\Users\\Student\\app.js"));
console.log(path.win32.isAbsolute("\\\\server\\shared\\report.pdf"));
```

### Exercise 2

```js
path.extname("index.js");       // ".js"
path.extname("archive.tar.gz"); // ".gz"
path.extname("README");        // ""
path.extname(".env");          // ""
path.extname("photo.JPG");     // ".JPG"
path.extname("file.");          // "."
```

Only the final suffix beginning with a non-leading dot is treated as the extension. `.env` is a dotfile whose leading dot is part of the name.

### Exercise 3

```js
const path = require("node:path");

console.log("Path separator:", path.sep);
console.log("Path-list delimiter:", path.delimiter);
```

`sep` separates portions of one path. `delimiter` separates multiple path values in lists such as the `PATH` environment variable.

---

## Part B solutions

### Exercise 4

```js
const path = require("node:path");

const courseMaterial = path.join(
  __dirname,
  "materials",
  "week-02",
  "express-introduction.md"
);

console.log("Complete:", courseMaterial);
console.log("Directory:", path.dirname(courseMaterial));
console.log("Base:", path.basename(courseMaterial));
console.log("Extension:", path.extname(courseMaterial));
console.log("Name:", path.basename(courseMaterial, ".md"));
console.log("Absolute:", path.isAbsolute(courseMaterial));
```

### Exercise 5

```js
const path = require("node:path");

const joined = path.join("uploads", "images", "avatar.png");
const resolved = path.resolve("uploads", "images", "avatar.png");

console.log({ joined, resolved });
```

`resolved` is absolute and depends on `process.cwd()`. `joined` remains relative because no absolute segment was provided. Starting the program from another directory changes `resolved`.

### Exercise 6

```js
const path = require("node:path");

const original = "/reports/2026/august-sales.csv";
const parsed = path.posix.parse(original);

const renamed = path.posix.format({
  dir: parsed.dir,
  name: `${parsed.name}-backup`,
  ext: parsed.ext,
});

console.log(parsed);
console.log(renamed);
```

### Exercise 7

```js
const path = require("node:path");

const result = path.posix.normalize(
  "users//student/./projects/node/../express/app.js"
);

console.log(result);
// users/student/projects/express/app.js
```

Repeated separators collapse, `.` is removed, and `node/..` cancels because `..` moves to the parent of `node`.

### Exercise 8

```js
const path = require("node:path");

const result = path.posix.relative(
  "/school/backend/src/controllers",
  "/school/backend/public/images/logo.png"
);

console.log(result);
// ../../public/images/logo.png
```

The first `..` moves from `controllers` to `src`; the second moves from `src` to `backend`. The remaining segments descend through `public/images/logo.png`.

---

## Part C solutions

### Exercise 9

```js
const path = require("node:path");

function getUploadPath(userId, fileName) {
  return path.resolve("uploads", String(userId), fileName);
}

console.log(getUploadPath(42, "avatar.png"));
```

The function only returns a string. It does not create any directory or file.

### Exercise 10

```js
const path = require("node:path");

function getFileInfo(filePath) {
  const absolutePath = path.resolve(filePath);
  const parsed = path.parse(absolutePath);

  return {
    absolutePath,
    directory: parsed.dir,
    fileName: parsed.base,
    nameWithoutExtension: parsed.name,
    extension: parsed.ext.toLowerCase(),
    isAbsolute: path.isAbsolute(absolutePath),
  };
}

console.log(getFileInfo("./uploads/REPORT.Final.PDF"));
```

### Exercise 11

```js
const path = require("node:path");

const allowedImageExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
]);

function isAllowedImage(fileName) {
  return allowedImageExtensions.has(path.extname(fileName).toLowerCase());
}

const examples = [
  "profile.JPG",
  "banner.png",
  "animation.GiF",
  "notes.txt",
  "fake.jpg.exe",
  ".jpg",
];

for (const example of examples) {
  console.log(example, isAllowedImage(example));
}
```

Expected booleans: `true`, `true`, `true`, `false`, `false`, `false`. This checks only the name, not the actual file contents.

### Exercise 12

```js
const path = require("node:path");

function createStoredName(originalName, id) {
  const extension = path.extname(originalName);
  return `${id}${extension}`;
}

console.log(createStoredName("holiday.photo.JPG", "abc123"));
console.log(createStoredName("README", "doc9"));
```

Using a template literal here is appropriate because a new file **name** is being formed, not a multi-segment path.

### Exercise 13

```js
const path = require("node:path");

function resolvePublicFile(publicDirectory, requestedPath) {
  const base = path.resolve(publicDirectory);
  const candidate = path.resolve(base, requestedPath);
  const relative = path.relative(base, candidate);

  const escapesBase =
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative);

  if (escapesBase) {
    throw new Error("Path traversal rejected");
  }

  return candidate;
}

const publicDirectory = path.join(__dirname, "public");

for (const requestedPath of [
  "images/logo.png",
  "css/main.css",
  "../private.txt",
  "images/../../.env",
]) {
  try {
    console.log("ACCEPT", resolvePublicFile(publicDirectory, requestedPath));
  } catch (error) {
    console.log("REJECT", requestedPath, error.message);
  }
}
```

A character-prefix check confuses sibling names such as `/app/public` and `/app/publicity`. The relative-path approach tests path segments instead.

### Exercise 14

```js
const path = require("node:path");

const entries = (process.env.PATH || "")
  .split(path.delimiter)
  .filter(Boolean);

entries.forEach((entry, index) => {
  console.log(`${index + 1}. ${entry}`);
});

const absoluteCount = entries.filter((entry) => path.isAbsolute(entry)).length;
console.log("Absolute entries:", absoluteCount);
```

---

## Part D solutions

### Exercise 15

```js
const logFile = path.join(__dirname, "logs", "application.log");
```

Backslashes are Windows-specific separators. `join()` selects the correct separator for the current platform.

### Exercise 16

```js
const templatePath = path.join(__dirname, "templates", "welcome.html");
```

`resolve("templates", ...)` uses the working directory when no absolute path was supplied. `__dirname` anchors the location to the source module instead.

### Exercise 17

```js
function isPdf(fileName) {
  return path.extname(fileName).toLowerCase() === ".pdf";
}
```

The extension contains its leading dot and preserves its original case.

### Exercise 18

```text
/exports/final.json
```

`dir` takes precedence over `root`, while `base` takes precedence over `name` and `ext`.

On Node.js v19.0.0 or newer, the second expression returns `/report.pdf`. Since v19, `format()` supplies the leading dot when `ext` is `"pdf"` instead of `".pdf"`. Older versions require the dot to be supplied.

---

## Part E reference implementation

### `static-path.js`

```js
const path = require("node:path");

const supportedExtensions = new Set([
  ".html",
  ".css",
  ".js",
  ".png",
  ".jpg",
  ".svg",
]);

function getPublicRoot() {
  return path.join(__dirname, "public");
}

function resolveAsset(requestedPath) {
  const base = path.resolve(getPublicRoot());
  const candidate = path.resolve(base, requestedPath);
  const relative = path.relative(base, candidate);

  const escapesBase =
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative);

  if (escapesBase) {
    throw new Error("Asset must stay inside the public directory");
  }

  return candidate;
}

function getAssetInfo(requestedPath) {
  const parsed = path.parse(resolveAsset(requestedPath));

  return {
    dir: parsed.dir,
    base: parsed.base,
    name: parsed.name,
    ext: parsed.ext.toLowerCase(),
  };
}

function isSupportedAsset(requestedPath) {
  return supportedExtensions.has(path.extname(requestedPath).toLowerCase());
}

module.exports = {
  getPublicRoot,
  resolveAsset,
  getAssetInfo,
  isSupportedAsset,
};
```

### `static-path.test.js`

```js
const assert = require("node:assert/strict");
const path = require("node:path");
const {
  getPublicRoot,
  resolveAsset,
  getAssetInfo,
  isSupportedAsset,
} = require("./static-path");

assert.equal(path.isAbsolute(getPublicRoot()), true);
assert.equal(resolveAsset("css/main.css"), path.join(getPublicRoot(), "css", "main.css"));
assert.equal(getAssetInfo("scripts/app.JS").ext, ".js");
assert.equal(getAssetInfo("scripts/app.JS").name, "app");
assert.equal(isSupportedAsset("styles/main.CSS"), true);
assert.equal(isSupportedAsset("photo.jpg"), true);
assert.equal(isSupportedAsset("notes.txt"), false);
assert.equal(isSupportedAsset("fake.png.exe"), false);

assert.throws(() => resolveAsset(".."));
assert.throws(() => resolveAsset("../secret.txt"));
assert.throws(() => resolveAsset("images/../../secret.txt"));
assert.throws(() => resolveAsset("../../../system.ini"));

console.log("All tests passed");
```

---

## Part F solutions

### Exercise 20

```js
const path = require("node:path");

function isJavaScriptSource(filePath) {
  if (typeof path.matchesGlob !== "function") {
    throw new Error("This Node.js version does not support path.matchesGlob()");
  }

  return path.matchesGlob(filePath, "src/**/*.js");
}

for (const filePath of [
  "src/app.js",
  "src/controllers/user.js",
  "src/controllers/user.test.js",
  "public/app.js",
  "src/styles/main.css",
]) {
  console.log(filePath, isJavaScriptSource(filePath));
}
```

The expected booleans are `true`, `true`, `true`, `false`, and `false`. The method matches one supplied string; it does not inspect the disk. It was added in v20.17.0 and v22.5.0, then marked stable in v22.20.0 and v24.8.0.

### Exercise 21

```js
const path = require("node:path");

console.log(path.join(""));          // "."
console.log(path.normalize(""));     // "."
console.log(path.resolve());         // process.cwd()
console.log(path.isAbsolute(""));    // false
console.log(path.relative("", "")); // ""
```

`join()` and `normalize()` use `.` as the string representation of the current directory for a zero-length result. `resolve()` creates an absolute path and therefore returns the absolute current working directory. `isAbsolute()` examines the literal form and returns `false` for an empty string. `relative()` treats each empty argument as the current working directory, and the relative path from a directory to itself is an empty string.

### Exercise 22

```js
const path = require("node:path");

console.log(path.posix.basename("/courses/node/"));
// node

console.log(path.posix.dirname("/courses/node/"));
// /courses

console.log(path.posix.parse("/courses/node/"));
// { root: "/", dir: "/courses", base: "node", ext: "", name: "node" }

console.log(path.posix.normalize("/courses/node//"));
// /courses/node/

console.log(path.posix.resolve("/courses/node/"));
// /courses/node
```

`basename()`, `dirname()`, and `parse()` ignore trailing separators for identifying path portions. `normalize()` preserves a trailing separator. `resolve()` removes it unless the result is the root directory.

### Exercise 23

`C:\\` explicitly means the root of drive C. `C:` is drive-relative and Windows can resolve it using the working directory remembered for that drive. Avoid the drive-relative form when application behavior must be unambiguous.

### Exercise 24

```js
const path = require("node:path");

const absolutePath = path.resolve("examples", "file.txt");
console.log(path.toNamespacedPath(absolutePath));
```

The method is meaningful only on Windows, where it returns an equivalent namespace-prefixed path. On POSIX it returns the path unchanged. Most application code does not need it. Unlike most `path` APIs, the documented behavior for a non-string argument is to return that argument unchanged.

## Exit-ticket answers

1. `path.join()`
2. `path.resolve()`
3. `path.extname()`
4. `__dirname` is the current CommonJS module's directory; `process.cwd()` is the process's launch/working directory.
5. No. Normalization cleans a path string but does not establish authorization or safe containment.
