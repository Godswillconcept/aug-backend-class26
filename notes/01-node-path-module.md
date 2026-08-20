# Node.js Built-in Modules: The `path` Module

> Documentation basis: [official Node.js `path` API documentation](https://nodejs.org/docs/latest/api/path.html), reviewed on 5 August 2026. At the time of review, the latest page reports Node.js v26.6.0 and marks `node:path` as **Stability: 2 — Stable**. Version-dependent features are identified below so students using older Node.js releases can follow the lesson safely.

## Lesson overview

The Node.js `path` module provides utilities for working with file and directory path **strings**. It helps us build, inspect, normalize, and compare paths in a way that works consistently across operating systems.

> Important: `path` works with strings. It does not create, read, rename, move, or delete files and folders. Use modules such as `fs` or `fs/promises` when you need to interact with the file system.

### Learning objectives

By the end of this lesson, students should be able to:

1. Explain what a file-system path is.
2. Import and use a Node.js built-in module.
3. Explain the difference between absolute and relative paths.
4. Explain the difference between `process.cwd()` and `__dirname`.
5. Build paths safely with `path.join()` and `path.resolve()`.
6. Extract parts of a path with `dirname()`, `basename()`, and `extname()`.
7. Convert between complete paths and path objects with `parse()` and `format()`.
8. Normalize, compare, and validate path strings.
9. Write cross-platform code using `sep`, `delimiter`, `win32`, and `posix`.
10. Match path strings against glob patterns with `matchesGlob()` on supported Node.js versions.
11. Explain the limited, Windows-specific purpose of `toNamespacedPath()`.
12. Avoid common path-related bugs and security mistakes.

---

## 1. What is a path?

A path is a string that describes the location of a file or directory.

Examples:

```text
Windows absolute path: C:\Users\Ada\project\index.js
POSIX absolute path:   /home/ada/project/index.js
Relative path:         ./project/index.js
Parent-relative path:  ../images/logo.png
```

Windows normally uses a backslash (`\`) as its path separator. Linux and macOS use a forward slash (`/`). Hard-coding either separator can make an application fail on another operating system. The `path` module handles these differences for us.

### A path may contain these parts

Given `/home/ada/project/report.final.pdf`:

| Part | Value | Meaning |
| --- | --- | --- |
| Root | `/` | Beginning of the file system |
| Directory | `/home/ada/project` | Folder containing the file |
| Base name | `report.final.pdf` | Last part of the path |
| File name | `report.final` | Base name without its final extension |
| Extension | `.pdf` | Final extension, including the leading dot |

### Absolute and relative paths

An **absolute path** contains enough information to locate a resource from the root of the file system.

```text
/var/www/app/server.js
C:\projects\shop\server.js
```

A **relative path** is interpreted from a starting directory, usually the current working directory.

```text
./server.js
../config/database.json
assets/logo.png
```

The meaning of a relative path can change when the program is started from a different directory.

---

## 2. Importing the `path` module

`path` is built into Node.js, so it does not need to be installed with npm.

The complete module is stable. Individual methods can still have their own version history, so check the Node.js version before teaching a recently added API such as `matchesGlob()`.

### CommonJS

This matches the module system currently used in this class repository:

```js
const path = require("node:path");
```

Older code often uses this equivalent form:

```js
const path = require("path");
```

The `node:` prefix clearly tells readers that the dependency is a Node.js built-in module. It is a good convention for new code.

### ES modules

```js
import path from "node:path";
```

Named imports can also be used:

```js
import { join, basename } from "node:path";
```

Platform-specific implementations can be imported directly in supported Node.js versions:

```js
const posixPath = require("node:path/posix");
const windowsPath = require("node:path/win32");
```

These are equivalent to `require("node:path").posix` and `require("node:path").win32`. The direct subpath forms were exposed in Node.js v15.3.0.

Do not mix `require()` and `import` casually. Which syntax is available depends on the project's Node.js module configuration.

---

## 3. `path.join()` — combine path segments

### Syntax

```js
path.join(...segments)
```

`join()`:

- accepts any number of string segments;
- inserts the correct operating-system separator;
- removes unnecessary separators;
- resolves `.` and `..` segments through normalization;
- returns a normalized path string.

Zero-length segments are ignored. If all supplied segments produce a zero-length result, the method returns `.`.

```js
const path = require("node:path");

const filePath = path.join("users", "ada", "documents", "report.pdf");
console.log(filePath);
```

Typical output:

```text
Windows: users\ada\documents\report.pdf
POSIX:   users/ada/documents/report.pdf
```

More examples:

```js
console.log(path.join("public", "images", "logo.png"));
console.log(path.join("public/", "/images/", "logo.png"));
console.log(path.join("public", "css", "..", "images", "logo.png"));
```

All three expressions produce an equivalent normalized path ending in `public/images/logo.png` on POSIX or `public\images\logo.png` on Windows.

### Why not concatenate strings?

Avoid this:

```js
const filePath = "uploads/" + userId + "/" + fileName;
```

Prefer this:

```js
const filePath = path.join("uploads", userId, fileName);
```

`join()` handles separators and normalization. However, it does **not** automatically make untrusted user input safe; security is covered later in this note.

### Type rule

Every argument must be a string. Otherwise, Node.js throws a `TypeError`.

```js
path.join("users", 42); // TypeError
path.join("users", String(42)); // valid
```

### Empty input

If the final joined path is an empty string, `join()` returns `.` to represent the current directory.

```js
console.log(path.join("")); // .
```

---

## 4. `path.resolve()` — produce an absolute path

### Syntax

```js
path.resolve(...segments)
```

`resolve()` builds an absolute path. It processes path segments from **right to left** until it finds an absolute path. If none is supplied, Node.js uses `process.cwd()` as the starting point.

Zero-length segments are ignored. The result is normalized, and trailing separators are removed unless the result is the file-system root.

```js
const absolutePath = path.resolve("public", "images", "logo.png");
console.log(absolutePath);
```

If the current working directory is `/home/ada/shop`, the result is:

```text
/home/ada/shop/public/images/logo.png
```

### Right-to-left behavior

```js
path.resolve("/first", "/second", "file.txt");
```

On POSIX, the result is `/second/file.txt`, not `/first/second/file.txt`. Once `/second` is found while scanning from the right, segments farther left are unnecessary.

### Windows per-drive working directories

Windows supports a current working directory for each drive. As a result, these two values are not necessarily equivalent:

```js
path.win32.resolve('C:');
path.win32.resolve('C:\\');
```

`C:\` explicitly means the root of drive C. `C:` is drive-relative and may use the current directory remembered for that drive. Prefer a drive letter followed by a separator when you mean the drive root.

### Empty input

```js
console.log(path.resolve());
console.log(process.cwd());
```

These return the same absolute path.

### `join()` versus `resolve()`

| Question | `path.join()` | `path.resolve()` |
| --- | --- | --- |
| Main purpose | Combine segments | Create an absolute path |
| Always absolute? | No | Yes |
| Uses `process.cwd()`? | No | Yes, if needed |
| Processes segments | Left to right as a join | Right to left until absolute |
| Normalizes result? | Yes | Yes |

```js
path.join("uploads", "avatar.png");
// uploads/avatar.png

path.resolve("uploads", "avatar.png");
// /current/working/directory/uploads/avatar.png
```

Use `join()` when you want to assemble segments. Use `resolve()` when the program needs an absolute location.

---

## 5. `process.cwd()`, `__dirname`, and `__filename`

These values are often used with `path`, but they are not methods of the `path` module.

### `process.cwd()`

`process.cwd()` returns the directory from which the Node.js process was started.

```js
console.log(process.cwd());
```

### `__dirname`

In CommonJS, `__dirname` is the absolute directory containing the current module file.

```js
console.log(__dirname);
```

### `__filename`

In CommonJS, `__filename` is the absolute path of the current module file.

```js
console.log(__filename);
```

### Why the difference matters

Suppose the file is located at `/home/ada/shop/src/utils/read.js`, but it is started from `/home/ada/shop`:

```text
process.cwd() -> /home/ada/shop
__dirname     -> /home/ada/shop/src/utils
__filename    -> /home/ada/shop/src/utils/read.js
```

Use `process.cwd()` for paths intentionally relative to where the application was launched, such as a project-level configuration file. Use `__dirname` for resources stored relative to the current source file.

```js
const configFromProject = path.join(process.cwd(), "config", "app.json");
const templateNearModule = path.join(__dirname, "templates", "welcome.html");
```

### ES module equivalent

ES modules do not provide CommonJS's `__dirname` and `__filename` variables directly. Use `import.meta.url` and `fileURLToPath()`:

```js
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

`fileURLToPath()` is important because a file URL and a file-system path are not the same representation.

---

## 6. `path.basename()` — get the last part

### Syntax

```js
path.basename(inputPath);
path.basename(inputPath, suffix);
```

`basename()` returns the last portion of a path.

```js
console.log(path.basename("/users/ada/photo.jpg"));
// photo.jpg
```

An optional suffix can be removed:

```js
console.log(path.basename("/users/ada/photo.jpg", ".jpg"));
// photo
```

The suffix is matched literally; it is not a general instruction to remove any extension.

```js
console.log(path.basename("photo.jpeg", ".jpg"));
// photo.jpeg
```

The suffix comparison is case-sensitive, even on Windows where the file system commonly treats filenames case-insensitively:

```js
path.win32.basename("C:\\files\\photo.JPG", ".jpg");
// photo.JPG
```

Trailing directory separators are ignored before the last portion is returned.

`basename()` only processes the string. It does not confirm that the file exists.

---

## 7. `path.dirname()` — get the directory portion

### Syntax

```js
path.dirname(inputPath)
```

`dirname()` returns everything except the last path portion.

Trailing directory separators are ignored.

```js
console.log(path.dirname("/users/ada/photo.jpg"));
// /users/ada
```

```js
const logFile = path.join(__dirname, "logs", "app.log");
const logDirectory = path.dirname(logFile);

console.log(logFile);
console.log(logDirectory);
```

This is useful when a program needs to create or inspect a file's parent directory.

---

## 8. `path.extname()` — get the final extension

### Syntax

```js
path.extname(inputPath)
```

`extname()` returns the extension of the last path portion, including the leading dot.

```js
path.extname("report.pdf");          // ".pdf"
path.extname("report.final.pdf");    // ".pdf"
path.extname("README");             // ""
path.extname("archive.tar.gz");     // ".gz"
path.extname(".gitignore");          // ""
path.extname("file.");               // "."
```

Important details:

- Only the final extension is returned.
- A leading dot by itself usually represents a dotfile name, not an extension.
- The returned extension preserves its original letter case.

```js
path.extname("PHOTO.JPG"); // ".JPG"
```

For case-insensitive checks, normalize the case:

```js
const extension = path.extname(fileName).toLowerCase();

if (extension === ".jpg" || extension === ".png") {
  console.log("Supported image");
}
```

Do not rely only on a file extension to prove a file's real content type. A user can rename a harmful or unrelated file.

---

## 9. `path.parse()` — split a path into an object

### Syntax

```js
path.parse(inputPath)
```

```js
const details = path.parse("/home/ada/reports/sales.final.csv");
console.log(details);
```

POSIX result:

```js
{
  root: "/",
  dir: "/home/ada/reports",
  base: "sales.final.csv",
  ext: ".csv",
  name: "sales.final"
}
```

Field meanings:

| Property | Meaning |
| --- | --- |
| `root` | File-system root |
| `dir` | Complete directory portion |
| `base` | File name plus extension |
| `ext` | Final extension, including the dot |
| `name` | Base name without the final extension |

Notice that `dir` includes `root`; `base` includes both `name` and `ext`.

---

## 10. `path.format()` — build a path from an object

### Syntax

```js
path.format(pathObject)
```

`format()` performs the reverse kind of operation to `parse()`.

```js
const formatted = path.format({
  dir: "/home/ada/reports",
  name: "sales-final",
  ext: ".csv",
});

console.log(formatted);
// /home/ada/reports/sales-final.csv
```

Since Node.js v19.0.0, `format()` automatically adds the leading dot when `ext` does not include one:

```js
path.posix.format({ root: "/", name: "report", ext: "pdf" });
// /report.pdf on Node.js 19+
```

For code that must also run on older Node.js versions, supply `.pdf` explicitly.

### Property precedence

When overlapping properties are supplied:

- `dir` is used instead of `root`.
- `base` is used instead of `name` plus `ext`.

```js
path.format({
  dir: "/reports",
  base: "actual.txt",
  name: "ignored",
  ext: ".csv",
});
// /reports/actual.txt
```

A practical rename operation on a string:

```js
const original = path.parse("/reports/sales.csv");

const renamed = path.format({
  dir: original.dir,
  name: `${original.name}-backup`,
  ext: original.ext,
});

console.log(renamed);
// /reports/sales-backup.csv
```

This constructs a new path string; it does not rename a real file.

---

## 11. `path.normalize()` — clean a path string

### Syntax

```js
path.normalize(inputPath)
```

`normalize()`:

- replaces repeated separators with the platform's preferred separator;
- resolves `.` segments;
- resolves `..` segments where possible;
- preserves trailing separators.

```js
console.log(path.normalize("users//ada/./documents/../images/photo.jpg"));
```

Typical POSIX result:

```text
users/ada/images/photo.jpg
```

An empty string becomes `.`:

```js
path.normalize(""); // "."
```

Normalization is useful for consistency, but it is not a complete security check and does not verify that the resulting path exists.

The official documentation also notes a POSIX edge case: `normalize()` converts two leading forward slashes to one, although a few POSIX systems give exactly two leading slashes special meaning. Normalization can therefore change how an underlying system interprets certain unusual paths.

---

## 12. `path.isAbsolute()` — test the path form

### Syntax

```js
path.isAbsolute(inputPath)
```

It returns `true` when the path string is absolute for the current platform.

```js
path.isAbsolute("/home/ada/file.txt"); // true on POSIX
path.isAbsolute("documents/file.txt"); // false
path.isAbsolute("");                   // false
```

On Windows, examples include:

```js
path.win32.isAbsolute("C:\\temp\\file.txt"); // true
path.win32.isAbsolute("\\\\server\\share"); // true for a UNC path
path.win32.isAbsolute("temp\\file.txt");     // false
```

`isAbsolute()` is not a security guarantee. An absolute user-supplied path can still point somewhere the application should not access.

---

## 13. `path.relative()` — describe one path from another

### Syntax

```js
path.relative(from, to)
```

`relative()` returns the relative path needed to travel from `from` to `to`. Both inputs are resolved before comparison.

```js
const from = "/home/ada/project/src";
const to = "/home/ada/project/public/images/logo.png";

console.log(path.posix.relative(from, to));
// ../../public/images/logo.png
```

If both resolved paths are the same, the result is an empty string:

```js
path.relative("/app/src", "/app/src"); // ""
```

If either argument is an empty string, Node.js uses the current working directory for that argument. Both arguments must be strings.

A useful relationship is:

```js
path.resolve(from, path.relative(from, to)) === path.resolve(to)
```

This is generally true when both paths can be meaningfully related on the same platform and drive.

---

## 14. `path.matchesGlob()` — match a path against a glob

### Syntax

```js
path.matchesGlob(inputPath, pattern)
```

`matchesGlob()` returns a boolean indicating whether a path string matches a glob pattern.

```js
const path = require("node:path");

path.matchesGlob("src/controllers/user.js", "src/**/*.js");
// true

path.matchesGlob("public/images/logo.png", "public/**/*.css");
// false
```

A glob is a compact pattern for matching names or path strings. Common pattern symbols include `*` for a varying portion and `**` for matching across directory levels. Keep patterns simple in an introductory lesson and test the exact patterns used by your application.

Important details from the official documentation:

- Added in Node.js v22.5.0 and v20.17.0.
- Marked stable in Node.js v24.8.0 and v22.20.0.
- Both `inputPath` and `pattern` must be strings; otherwise Node.js throws `TypeError`.
- It compares strings against a pattern. It does not search the disk or prove that a matched file exists.

Check support before using it in class:

```js
if (typeof path.matchesGlob !== "function") {
  console.log("Upgrade Node.js to use path.matchesGlob()");
}
```

Do not confuse `matchesGlob()` with file discovery. To obtain files from disk, use an appropriate file-system API or globbing tool; `matchesGlob()` only answers whether one supplied string matches one supplied pattern.

---

## 15. Platform helpers

### `path.sep`

`path.sep` is the platform-specific path separator.

```js
console.log(path.sep);
// Windows: \
// POSIX:   /
```

Usually `join()` is better than manually inserting `path.sep`, but `sep` is useful when parsing platform-native path text.

### `path.delimiter`

`path.delimiter` separates multiple paths stored in environment variables such as `PATH`.

```js
console.log(path.delimiter);
// Windows: ;
// POSIX:   :

const pathEntries = (process.env.PATH || "").split(path.delimiter);
console.log(pathEntries);
```

Do not confuse:

- `path.sep`: separates folders inside one path.
- `path.delimiter`: separates several paths in a list.

### `path.win32` and `path.posix`

By default, `path` follows the operating system on which Node.js is running. Use `path.win32` or `path.posix` when you need predictable behavior for a particular path style, regardless of the host OS.

```js
path.win32.basename("C:\\users\\ada\\photo.jpg");
// photo.jpg

path.posix.basename("/users/ada/photo.jpg");
// photo.jpg
```

This matters when a Linux server processes path strings received from a Windows machine, or when software generates archive paths that must always use `/`.

---

## 16. `path.toNamespacedPath()` — Windows namespace form

### Syntax

```js
path.toNamespacedPath(inputPath)
```

On Windows, this returns an equivalent namespace-prefixed path. Such paths are mainly relevant to Windows-specific low-level or long-path interoperability. On POSIX, the method returns the input unchanged.

```js
const normalPath = "C:\\projects\\backend\\server.js";
const namespacedPath = path.toNamespacedPath(normalPath);

console.log(namespacedPath);
// A Windows namespace-prefixed equivalent
```

This is an advanced, platform-specific API. Most ordinary application paths should continue to use `join()` and `resolve()`. The official API documents an unusual compatibility behavior: if the argument is not a string, `toNamespacedPath()` returns it unchanged rather than applying the usual path-method `TypeError` rule.

---

## 17. Using `path` with the file system

The `path` module calculates the location; `fs` performs the operation.

```js
const path = require("node:path");
const fs = require("node:fs/promises");

async function readWelcomeTemplate() {
  const templatePath = path.join(
    __dirname,
    "templates",
    "welcome.html"
  );

  const content = await fs.readFile(templatePath, "utf8");
  return content;
}
```

Another example creates a directory:

```js
const path = require("node:path");
const fs = require("node:fs/promises");

async function createUploadFolder(userId) {
  const uploadDirectory = path.join(
    process.cwd(),
    "uploads",
    String(userId)
  );

  await fs.mkdir(uploadDirectory, { recursive: true });
  return uploadDirectory;
}
```

---

## 18. Path security and directory traversal

Suppose an application serves files from a `public` directory:

```js
const requestedName = "../../private/passwords.txt";
const result = path.join(__dirname, "public", requestedName);
```

Normalization may move the result outside `public`. This is called a **directory traversal** or **path traversal** problem.

Never assume that using `join()`, `normalize()`, or `resolve()` makes untrusted input safe.

### Safer containment check

Resolve the trusted base and candidate, then verify their relationship:

```js
const path = require("node:path");

function resolveInside(baseDirectory, userPath) {
  const base = path.resolve(baseDirectory);
  const candidate = path.resolve(base, userPath);
  const relative = path.relative(base, candidate);

  const escapesBase =
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative);

  if (escapesBase) {
    throw new Error("Requested path is outside the allowed directory");
  }

  return candidate;
}

const publicDirectory = path.join(__dirname, "public");

console.log(resolveInside(publicDirectory, "images/logo.png"));
// accepted

console.log(resolveInside(publicDirectory, "../../private.txt"));
// throws an error
```

Why each check exists:

- `relative === ".."` catches the base's direct parent.
- `relative.startsWith(`..${path.sep}`)` catches anything under an ancestor.
- `path.isAbsolute(relative)` catches cases that cannot be represented inside the base, including some cross-drive Windows cases.

Production systems may need additional controls: symbolic-link checks, allowlisted filenames, permission rules, content validation, and safe file-serving libraries. String checks alone cannot protect against every file-system race or symbolic-link scenario.

### Never compare by a simple prefix

This is unsafe:

```js
candidate.startsWith(base);
```

If the base is `/app/public`, then `/app/publicity/secret.txt` also starts with the same characters. Use `path.relative()` and separator-aware checks.

---

## 19. Common mistakes

### Mistake 1: Hard-coding separators

```js
const avatar = __dirname + "/uploads/" + fileName;
```

Use:

```js
const avatar = path.join(__dirname, "uploads", fileName);
```

### Mistake 2: Assuming `join()` returns an absolute path

```js
path.join("uploads", "photo.jpg"); // can be relative
```

Use `path.resolve()` or include an absolute base when an absolute result is required.

### Mistake 3: Confusing `cwd()` and `__dirname`

The working directory depends on where the command was started. The module directory depends on where the source file is stored.

### Mistake 4: Believing that `path` checks the disk

```js
path.extname("missing.pdf"); // ".pdf", even if it does not exist
```

### Mistake 5: Treating extension checks as content validation

`virus.exe` can be renamed to `holiday.jpg`. Inspect content when security depends on file type.

### Mistake 6: Trusting user-provided path segments

User input may contain `..`, absolute paths, separators, encoded values, or symbolic-link targets. Validate and restrict it according to the application's threat model.

### Mistake 7: Using the host parser for foreign path text

A POSIX machine does not automatically interpret Windows backslashes as separators. Use `path.win32` for Windows-style strings and `path.posix` for POSIX-style strings.

---

## 20. Guided live-coding activity

Create `path-demo.js`:

```js
const path = require("node:path");

const courseFile = path.join(
  __dirname,
  "materials",
  "week-01",
  "node-path.md"
);

console.log("Complete path:", courseFile);
console.log("Directory:", path.dirname(courseFile));
console.log("Base name:", path.basename(courseFile));
console.log("Extension:", path.extname(courseFile));
console.log("Without extension:", path.basename(courseFile, ".md"));
console.log("Parsed object:", path.parse(courseFile));
console.log("Is absolute:", path.isAbsolute(courseFile));
console.log("From project root:", path.relative(process.cwd(), courseFile));
```

Run it:

```bash
node path-demo.js
```

Discussion prompts:

1. Which output changes between Windows and Linux?
2. Which output changes if the script is launched from another directory?
3. Why does `__dirname` make the material path stable?
4. Does the `materials` directory need to exist for these methods to work?

---

## 21. Method summary

| API | Purpose | Example result |
| --- | --- | --- |
| `path.join()` | Combine and normalize segments | `users/ada/file.txt` |
| `path.resolve()` | Produce an absolute path | `/app/users/ada/file.txt` |
| `path.basename()` | Return the last portion | `file.txt` |
| `path.dirname()` | Return the directory portion | `/app/users/ada` |
| `path.extname()` | Return the final extension | `.txt` |
| `path.parse()` | Convert a path to an object | `{ dir, base, name, ext, root }` |
| `path.format()` | Convert a path object to a string | `/app/file.txt` |
| `path.normalize()` | Normalize separators and dot segments | `users/ada/file.txt` |
| `path.isAbsolute()` | Test whether a path is absolute | `true` or `false` |
| `path.relative()` | Find a path from one location to another | `../../public/logo.png` |
| `path.matchesGlob()` | Test a path string against a glob | `true` or `false` |
| `path.sep` | Platform path separator | `\` or `/` |
| `path.delimiter` | Platform path-list delimiter | `;` or `:` |
| `path.toNamespacedPath()` | Produce a Windows namespace-prefixed equivalent | Windows-specific path string |
| `path.win32` | Force Windows path rules | Platform-independent Windows parsing |
| `path.posix` | Force POSIX path rules | Platform-independent POSIX parsing |

---

## 22. Review questions

1. Why does Node.js provide a `path` module instead of encouraging string concatenation?
2. What is the difference between an absolute path and a relative path?
3. What is the difference between `path.join()` and `path.resolve()`?
4. When should you use `__dirname` instead of `process.cwd()`?
5. What does `path.extname("archive.tar.gz")` return, and why?
6. Why does `path.extname(".env")` return an empty string?
7. Does `path.join()` create a directory or file?
8. What is the difference between `path.sep` and `path.delimiter`?
9. When are `path.win32` and `path.posix` useful?
10. Why is `path.normalize()` not sufficient protection against directory traversal?
11. What is the minimum Node.js version that introduced `path.matchesGlob()`?
12. Does `matchesGlob()` search the file system?
13. What changed in `path.format()` in Node.js v19.0.0?
14. Why can `path.win32.resolve('C:')` differ from `path.win32.resolve('C:\\')`?
15. On which operating system is `toNamespacedPath()` meaningful?

---

## 23. Suggested 90-minute teaching plan

| Time | Activity |
| --- | --- |
| 0–10 min | Define paths, absolute/relative paths, and operating-system differences |
| 10–20 min | Import `node:path`; introduce `join()` and `resolve()` |
| 20–30 min | Demonstrate `cwd()`, `__dirname`, and `__filename` |
| 30–45 min | Teach `basename()`, `dirname()`, `extname()`, `parse()`, and `format()` |
| 45–55 min | Teach `normalize()`, `isAbsolute()`, and `relative()` |
| 55–65 min | Explain `sep`, `delimiter`, `win32`, `posix`, and version checking |
| 65–75 min | Demonstrate `matchesGlob()` and complete the guided activity |
| 75–82 min | Discuss path traversal and containment checks |
| 82–90 min | Student quick exercises and review questions |

## Key takeaway

Use `path` to reason about locations without manually managing platform-specific separators. Choose `join()` for combining segments, `resolve()` for absolute locations, extraction methods for inspecting paths, `relative()` for comparing locations, and `matchesGlob()` for matching one path string on supported Node.js versions. Treat all user-controlled paths as untrusted input.
