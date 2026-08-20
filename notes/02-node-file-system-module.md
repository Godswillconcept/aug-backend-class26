# Node.js Built-in Modules: The `fs` File System Module

> Documentation basis: [official Node.js File System API documentation](https://nodejs.org/docs/latest/api/fs.html), reviewed on 5 August 2026. The current page reports Node.js v26.6.0 and marks `node:fs` as **Stability: 2 ? Stable**. Version-dependent APIs are identified throughout this note.

## Lesson overview

The Node.js `fs` module lets a program interact with files and directories. It can read and write content, create folders, list directory entries, inspect metadata, copy or move entries, remove entries, open streams, watch for changes, and work with low-level file handles.

Unlike `node:path`, which only manipulates path strings, `node:fs` performs real operating-system operations. Those operations can change or permanently delete data, so error handling and careful path construction are essential.

### Learning objectives

By the end of this unit, students should be able to:

1. Import the Promise, callback, and synchronous forms of `node:fs`.
2. Explain blocking and non-blocking file-system operations.
3. Read text, JSON, and binary data correctly.
4. Write, append, copy, rename, and safely remove files.
5. Create, inspect, list, copy, and remove directories.
6. Use `Stats` and `Dirent` objects to identify entry types and metadata.
7. Handle common system errors by their `code` property.
8. Explain race conditions and why checking before opening is often unsafe.
9. Use `FileHandle` correctly and close it reliably.
10. Choose whole-file methods or streams based on data size.
11. Explain flags, permissions, watchers, globbing, and platform differences.
12. Build a small persistent JSON repository without corrupting its data.

---

## 1. Importing the module

`fs` is built into Node.js and does not need an npm installation.

### Promise API ? recommended for most class examples

```js
const fs = require("node:fs/promises");
```

```js
async function main() {
  const content = await fs.readFile("message.txt", "utf8");
  console.log(content);
}

main().catch(console.error);
```

The Promise API was added in Node.js v10.0.0 and is stable. It uses Node.js's underlying thread pool for many operations. Concurrent modifications to the same file are not automatically synchronized or thread-safe.

### Callback and synchronous APIs

```js
const fs = require("node:fs");
```

This provides callback methods such as `fs.readFile()` and synchronous methods such as `fs.readFileSync()`.

### ES modules

```js
import * as fs from "node:fs/promises";
import { readFile, writeFile } from "node:fs/promises";
```

For callback and synchronous methods:

```js
import * as fs from "node:fs";
```

---

## 2. Three API styles

Most operations have Promise, callback, and synchronous forms.

### Promise style

```js
const fs = require("node:fs/promises");

async function showMessage() {
  try {
    const message = await fs.readFile("message.txt", "utf8");
    console.log(message);
  } catch (error) {
    console.error(error.message);
  }
}
```

The method returns a Promise. `await` pauses only the current async function; it does not block the entire JavaScript event loop.

### Callback style

```js
const fs = require("node:fs");

fs.readFile("message.txt", "utf8", (error, message) => {
  if (error) {
    console.error(error.message);
    return;
  }

  console.log(message);
});
```

The callback is the last argument. By Node.js convention, its first argument is reserved for an error. On success, it is `null` or `undefined`.

The official documentation notes that callback APIs can use less time and memory than Promise APIs when maximum performance is required. For ordinary application code, Promises are often easier to compose and teach.

### Synchronous style

```js
const fs = require("node:fs");

try {
  const message = fs.readFileSync("message.txt", "utf8");
  console.log(message);
} catch (error) {
  console.error(error.message);
}
```

Synchronous methods end in `Sync`. They block the event loop and all further JavaScript execution until completion. Exceptions are thrown directly.

Synchronous calls can be reasonable during one-time startup, small command-line scripts, build tooling, or tests. Avoid them in request handlers and other hot server paths.

| Style | Example | Result | Event-loop effect |
| --- | --- | --- | --- |
| Promise | `await fsPromises.readFile(...)` | Promise | Does not block JavaScript execution |
| Callback | `fs.readFile(..., callback)` | Callback receives result | Does not block JavaScript execution |
| Sync | `fs.readFileSync(...)` | Result directly | Blocks the event loop |

---

## 3. Paths accepted by `fs`

Most APIs accept a path as a string, a `Buffer` containing raw path bytes, or a WHATWG `file:` URL.

```js
const { readFile } = require("node:fs/promises");

await readFile("./data/message.txt", "utf8");
await readFile(Buffer.from("./data/message.txt"), "utf8");
await readFile(new URL("file:///tmp/message.txt"), "utf8");
```

For ordinary backend projects, use `node:path` to construct strings:

```js
const path = require("node:path");
const fs = require("node:fs/promises");

const filePath = path.join(__dirname, "data", "message.txt");
const content = await fs.readFile(filePath, "utf8");
```

Relative strings are interpreted from `process.cwd()`, not automatically from the current source file. File URLs have platform-specific restrictions; encoded separators such as `%2F` or `%5C` are rejected.

---

## 4. Reading files with `readFile()`

```js
await fs.readFile(path[, options])
```

Without an encoding, the result is a `Buffer`:

```js
const bytes = await fs.readFile("photo.png");

console.log(Buffer.isBuffer(bytes)); // true
console.log(bytes.length);           // bytes read
```

With an encoding, the result is a string:

```js
const text = await fs.readFile("message.txt", "utf8");
console.log(typeof text); // string
```

### Reading JSON

```js
async function readJson(filePath) {
  const source = await fs.readFile(filePath, "utf8");
  return JSON.parse(source);
}
```

`readFile()` can reject because the entry is missing or inaccessible; `JSON.parse()` can throw because the text is invalid. Both are caught by a surrounding `try...catch`.

### AbortSignal

```js
const controller = new AbortController();
const reading = fs.readFile("large-file.bin", {
  signal: controller.signal,
});

controller.abort();

try {
  await reading;
} catch (error) {
  if (error.name === "AbortError") console.log("Read cancelled");
}
```

Aborting cancels Node.js's internal buffering request, not necessarily every operating-system operation already in progress.

`readFile()` buffers the complete file in memory. Use it for modest configuration, templates, and JSON. Prefer `createReadStream()` for very large data. Node.js v26.4.0 added a version-specific `buffer` option for supplying or allocating a buffer.

---

## 5. Writing files with `writeFile()`

```js
await fs.writeFile(file, data[, options])
```

```js
await fs.writeFile("message.txt", "Hello, class!", "utf8");
```

Default behavior:

- creates the file when missing;
- replaces its contents when it exists;
- uses the `w` flag;
- resolves with `undefined` on success.

Write readable JSON:

```js
const users = [
  { id: 1, name: "Ada" },
  { id: 2, name: "Linus" },
];

const json = JSON.stringify(users, null, 2);
await fs.writeFile("users.json", `${json}\n`, "utf8");
```

Do not call `writeFile()` several times on the same file without waiting for each operation. Coordinate writes with `await`, a queue, or a higher-level store.

```js
await fs.writeFile(filePath, "first");
await fs.writeFile(filePath, "second");
```

The final content is predictably `second`. Starting both without awaiting introduces an ordering race.

On Node.js v20.10.0+ and v21.0.0+, `{ flush: true }` flushes data to the underlying descriptor before closing:

```js
await fs.writeFile("important.txt", "saved", {
  encoding: "utf8",
  flush: true,
});
```

This can improve durability expectations but does not make a multi-step update transactional.

---

## 6. Appending with `appendFile()`

```js
await fs.appendFile("application.log", "Server started\n", "utf8");
```

`appendFile()` adds data to the end and creates the file if necessary. Its default flag is `a`.

```js
async function log(message) {
  const line = `${new Date().toISOString()} ${message}\n`;
  await fs.appendFile("application.log", line, "utf8");
}
```

Concurrent processes can complicate ordering. Production logging normally needs a logging system designed for concurrency, rotation, and failures.

---

## 7. Creating directories with `mkdir()`

```js
await fs.mkdir("uploads");
```

This rejects with `EEXIST` when the directory already exists. For nested or repeatable setup:

```js
const uploadDirectory = path.join("uploads", "users", "42");
await fs.mkdir(uploadDirectory, { recursive: true });
```

With `recursive: true`, existing directories do not cause failure. The Promise resolves to the first directory created, or `undefined` if none was created. `mode` defaults to `0o777`, subject to the process umask, and is not fully supported on Windows.

---

## 8. Listing directories with `readdir()`

By default, `readdir()` returns names:

```js
const names = await fs.readdir("uploads");

for (const name of names) console.log(name);
```

Use `withFileTypes: true` for `Dirent` objects:

```js
const entries = await fs.readdir("uploads", { withFileTypes: true });

for (const entry of entries) {
  if (entry.isDirectory()) console.log("DIR ", entry.name);
  else if (entry.isFile()) console.log("FILE", entry.name);
  else if (entry.isSymbolicLink()) console.log("LINK", entry.name);
}
```

Useful `Dirent` methods include `isFile()`, `isDirectory()`, `isSymbolicLink()`, `isBlockDevice()`, `isCharacterDevice()`, `isFIFO()`, and `isSocket()`. Its current `parentPath` property identifies the parent.

The `recursive: true` option was added in Node.js v18.17.0 and v20.1.0:

```js
const allNames = await fs.readdir("src", { recursive: true });
```

`readdir()` order is not guaranteed. Sort explicitly when required. For huge trees, use `opendir()` to process entries incrementally.

---

## 9. Inspecting metadata with `stat()`

```js
const stats = await fs.stat("users.json");

console.log(stats.isFile());
console.log(stats.isDirectory());
console.log(stats.size);
console.log(stats.mtime);
```

| Field | Meaning |
| --- | --- |
| `size` | File size in bytes |
| `atime` | Last access time |
| `mtime` | Last content modification time |
| `ctime` | Last metadata/status change time; not creation time |
| `birthtime` | Creation time where the platform provides it |
| `mode` | Type and permission bits |
| `uid`, `gid` | Owner identifiers where supported |

Time values also have millisecond properties such as `mtimeMs`. With `{ bigint: true }`, numeric fields use `bigint` and nanosecond time properties are available.

### `stat()` versus `lstat()`

`stat()` follows a symbolic link and describes its target. `lstat()` describes the link itself.

```js
const targetStats = await fs.stat("shortcut");
const linkStats = await fs.lstat("shortcut");

console.log(targetStats.isFile());
console.log(linkStats.isSymbolicLink());
```

`statfs()` returns file-system-level statistics such as block counts and sizes. It was added in Node.js v18.15.0 and v19.6.0; it is not a substitute for `stat()` on an individual entry.

---

## 10. Error handling

File-system errors contain structured properties. Prefer `error.code` over matching a human-readable message.

```js
try {
  const content = await fs.readFile("settings.json", "utf8");
  console.log(content);
} catch (error) {
  if (error.code === "ENOENT") {
    console.error("The settings file does not exist");
  } else if (error.code === "EACCES" || error.code === "EPERM") {
    console.error("The process does not have permission");
  } else {
    throw error;
  }
}
```

| Code | Typical meaning |
| --- | --- |
| `ENOENT` | No such file or directory |
| `EEXIST` | Entry already exists |
| `EACCES` | Permission denied |
| `EPERM` | Operation not permitted |
| `EISDIR` | Expected a file but encountered a directory |
| `ENOTDIR` | A required path component is not a directory |
| `ENOTEMPTY` | Directory is not empty |
| `EMFILE` | Process has too many open files |
| `EXDEV` | Cross-device operation not permitted |

Other useful fields can include `errno`, `syscall`, `path`, and `dest`. Codes and behavior can differ by platform.

---

## 11. Existence and access checks

`access()` tests whether the current process can access an entry:

```js
const { constants } = require("node:fs");

await fs.access("report.txt", constants.R_OK | constants.W_OK);
```

- `F_OK`: entry exists;
- `R_OK`: readable;
- `W_OK`: writable;
- `X_OK`: executable/searchable.

Do not normally call `access()` before `open()`, `readFile()`, or `writeFile()`. Another process can change the entry between the check and the action. This is a time-of-check/time-of-use race.

Prefer the intended operation and handle its error:

```js
async function readOptional(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}
```

`fs.exists()` is deprecated and does not follow the normal error-first callback convention. `fs.existsSync()` is not deprecated, but it still should not be used as a pre-check when a race matters.

---

## 12. Copying and moving

Copy one file:

```js
await fs.copyFile("users.json", "backups/users.json");
```

The destination is overwritten by default. To fail if it exists:

```js
const { constants } = require("node:fs");

await fs.copyFile(
  "users.json",
  "backups/users.json",
  constants.COPYFILE_EXCL
);
```

Copy a tree with `cp()`:

```js
await fs.cp("public", "backup/public", {
  recursive: true,
  force: false,
  errorOnExist: true,
});
```

`cp()` was added in v16.7.0 and became non-experimental in v22.3.0. Options include `recursive`, `force`, `errorOnExist`, `filter`, `preserveTimestamps`, `dereference`, `verbatimSymlinks`, and copy `mode`.

Rename or move an entry:

```js
await fs.rename("draft.txt", "published.txt");
```

`rename()` can move within one file system. A cross-device move may fail with `EXDEV`; a robust fallback copies successfully and only then removes the source.

---

## 13. Removing entries

Remove a file or symbolic link:

```js
await fs.unlink("old-report.txt");
```

If it is a link, the link is removed without deleting its target.

Remove an empty directory:

```js
await fs.rmdir("empty-directory");
```

For general removal:

```js
await fs.rm("temporary", { recursive: true, force: true });
```

- `recursive: true` permits recursive directory removal.
- `force: true` ignores a missing target.
- `maxRetries` and `retryDelay` can retry some recursive-removal errors.

Recursive deletion is destructive. Resolve and verify the exact target first. Never pass an unvalidated user path or a broad project/system directory.

---

## 14. File flags

| Flag | Meaning |
| --- | --- |
| `r` | Read; fail if missing |
| `r+` | Read and write; fail if missing |
| `w` | Write; create or truncate |
| `wx` | Write exclusively; fail if path exists |
| `w+` | Read/write; create or truncate |
| `a` | Append; create if missing |
| `ax` | Append exclusively; fail if path exists |
| `a+` | Read and append; create if missing |

The `x` variants help prevent accidental overwrite:

```js
await fs.writeFile("invoice-1001.json", json, { flag: "wx" });
```

On some network file systems, exclusive flags may not behave atomically. File-system semantics still matter.

---

## 15. `open()` and `FileHandle`

```js
const handle = await fs.open("application.log", "a");

try {
  await handle.appendFile("new event\n", "utf8");
  const stats = await handle.stat();
  console.log(stats.size);
} finally {
  await handle.close();
}
```

`open()` resolves to a `FileHandle`, a wrapper around a numeric file descriptor. It supports operations including `read()`, `write()`, `readFile()`, `writeFile()`, `appendFile()`, `stat()`, `truncate()`, `sync()`, and stream creation.

Always close handles explicitly, preferably in `finally`. Node.js may attempt to close an abandoned handle and warn, but the official documentation says not to rely on that fallback.

`filehandle[Symbol.asyncDispose]()` became stable in Node.js v24.2.0. The `try...finally` pattern remains widely understood and version-compatible.

---

## 16. Temporary directories

```js
const os = require("node:os");
const path = require("node:path");

const prefix = path.join(os.tmpdir(), "backend-class-");
const temporaryDirectory = await fs.mkdtemp(prefix);

try {
  console.log(temporaryDirectory);
} finally {
  await fs.rm(temporaryDirectory, { recursive: true, force: true });
}
```

Six random characters are appended directly to the prefix. Current Node.js also documents `mkdtempDisposable()` and a synchronous equivalent for explicit resource management; manual cleanup works across more versions.

---

## 17. Streams for large files

Whole-file helpers buffer all content. Streams process chunks and provide backpressure.

```js
const fsSync = require("node:fs");
const { pipeline } = require("node:stream/promises");

await pipeline(
  fsSync.createReadStream("large-video.mp4"),
  fsSync.createWriteStream("large-video-copy.mp4")
);
```

`pipeline()` provides completion and error propagation. Use whole-file methods for modest configuration or JSON, streams for large uploads/downloads or incremental processing, and `FileHandle.read()`/`write()` for low-level random access.

---

## 18. Watching for changes

Promise watching returns an async iterator:

```js
const controller = new AbortController();
setTimeout(() => controller.abort(), 10_000);

try {
  for await (const event of fs.watch("config", {
    signal: controller.signal,
  })) {
    console.log(event.eventType, event.filename);
  }
} catch (error) {
  if (error.name !== "AbortError") throw error;
}
```

Events usually contain `eventType` (`change` or `rename`) and `filename`, which may be a string, Buffer, or `null`.

Watchers have platform caveats: recursive support differs, network/virtualized file systems may be unreliable, events can be coalesced, `filename` is not guaranteed, and delete/recreate behavior can be inode-dependent. Treat events as notifications to re-check state, not a perfect audit log.

---

## 19. Glob file discovery

Current Node.js provides `fsPromises.glob()` as an async iterator:

```js
for await (const file of fs.glob("src/**/*.js")) {
  console.log(file);
}
```

It was added in Node.js v22.0.0 and marked stable in v22.17.0 and v24.0.0. Options include:

- `cwd`: starting directory; default `process.cwd()`;
- `exclude`: filter function or array of patterns;
- `withFileTypes`: yield `Dirent` objects;
- `followSymlinks`: follow directory links during `**`, added in v26.1.0.

```js
for await (const file of fs.glob("**/*.js", {
  cwd: "src",
  exclude: ["**/*.test.js"],
})) {
  console.log(file);
}
```

Negation patterns such as `!secret.js` are not supported in `exclude`. With `followSymlinks`, detected link cycles are not recursively traversed.

`fs.glob()` discovers disk entries; `path.matchesGlob()` only compares one supplied string with a pattern.

---

## 20. Permissions and modes

```js
await fs.chmod("script.sh", 0o755);
```

POSIX octal permission digits combine read = `4`, write = `2`, and execute = `1` for owner, group, and others. `0o755` gives the owner read/write/execute and others read/execute. `0o644` commonly gives owner read/write and others read.

The process umask can remove creation bits. Windows does not implement POSIX modes identically, so do not build cross-platform authorization around `chmod()` alone.

Ownership methods such as `chown()` are platform- and permission-sensitive. Symbolic-link variants (`lchown()`, `lutimes()`) operate on the link itself.

---

## 21. Links, real paths, and timestamps

```js
await fs.link("report.txt", "report-hard-link.txt");
await fs.symlink("report.txt", "report-shortcut.txt");
```

A hard link is another directory entry for the same underlying file. A symbolic link stores a target path. Symlink creation has Windows-specific type and privilege rules.

```js
const target = await fs.readlink("report-shortcut.txt");
const canonical = await fs.realpath("report-shortcut.txt");
```

`readlink()` returns the stored target; `realpath()` resolves links to a canonical absolute path.

Change timestamps with `utimes(path, atime, mtime)`. Values may be dates, epoch numbers, or numeric strings. Invalid, infinite, or `NaN` values fail.

---

## 22. Other useful operations

- `truncate(path, length)` shortens or extends a file; the default length is zero.
- `openAsBlob(path, { type })` returns a file-backed `Blob`; it became stable in v22.17.0 and v24.0.0. Modifying the file afterward can cause Blob reads to fail.
- `opendir()` returns a `Dir` that can be asynchronously iterated and closed.
- `statfs()` describes the containing file system rather than an individual entry.
- `sync()` and `datasync()` on a `FileHandle` request data flushing with different metadata guarantees.

These are useful when an application has a specific requirement. Do not add low-level complexity when a whole-file helper is sufficient.

---

## 23. Safer JSON persistence

A basic read-modify-write flow is educational but can lose concurrent updates:

```js
async function addUser(filePath, user) {
  const source = await fs.readFile(filePath, "utf8");
  const users = JSON.parse(source);
  users.push(user);
  await fs.writeFile(filePath, `${JSON.stringify(users, null, 2)}\n`);
}
```

A safer single-process replacement writes a sibling temporary file and renames it:

```js
const path = require("node:path");

async function writeJsonAtomically(filePath, value) {
  const temporaryPath = path.join(
    path.dirname(filePath),
    `.${path.basename(filePath)}.${process.pid}.tmp`
  );

  const json = `${JSON.stringify(value, null, 2)}\n`;

  try {
    await fs.writeFile(temporaryPath, json, { flag: "wx" });
    await fs.rename(temporaryPath, filePath);
  } catch (error) {
    await fs.rm(temporaryPath, { force: true }).catch(() => {});
    throw error;
  }
}
```

Rename is commonly atomic when both names are on the same local file system. Durability, Windows replacement behavior, network storage, and multiple writers need more engineering. A database is normally right for shared concurrent state.

---

## 24. Security considerations

1. Never assume a joined user path remains inside an allowed directory; apply the containment check from the `path` lesson.
2. Do not expose raw errors to clients because they can reveal server paths.
3. Generate server-controlled upload names and validate content, not only extensions.
4. Limit upload sizes and stream large uploads.
5. Avoid following symbolic links when they could escape a trusted root.
6. Verify exact deletion targets before recursive `rm()`.
7. Run the process with only the permissions it needs.
8. Treat race conditions and multiple writers as design problems.

---

## 25. Common mistakes

### Forgetting the encoding

```js
const value = await fs.readFile("message.txt");
console.log(value); // Buffer
```

### Forgetting `await`

```js
const value = fs.readFile("message.txt", "utf8");
console.log(value); // Promise
```

### Mixing API styles

Methods from `node:fs/promises` do not take completion callbacks. Use the correct import.

### Blocking request handling

Synchronous disk access blocks all work on that event loop until completion.

### Checking before acting

`access()` followed by `readFile()` introduces a race. Attempt the action and handle failure.

### Ignoring rejected Promises

Use `await`, return the Promise, or attach an intentional rejection handler.

### Assuming directory order

`readdir()` order is not guaranteed. Sort for presentation or deterministic tests.

### Treating `ctime` as creation time

Use `birthtime` where supported. `ctime` is metadata/status change time.

### Leaking resources

Close every `FileHandle`, directory handle, watcher, and stream according to its lifecycle.

---

## 26. API decision table

| Need | API |
| --- | --- |
| Read a modest complete file | `readFile()` |
| Replace/create a complete file | `writeFile()` |
| Add to the end | `appendFile()` |
| Create directories | `mkdir({ recursive: true })` |
| List names | `readdir()` |
| List entry types | `readdir({ withFileTypes: true })` |
| Process a huge directory gradually | `opendir()` |
| Inspect target metadata | `stat()` |
| Inspect a link itself | `lstat()` |
| Copy one file | `copyFile()` |
| Copy a directory tree | `cp({ recursive: true })` |
| Move/rename on one file system | `rename()` |
| Delete a file/link | `unlink()` |
| General recursive removal | `rm()` |
| Prevent overwrite during creation | flag `wx` or `ax` |
| Work with a descriptor | `open()` / `FileHandle` |
| Process a large file | streams and `pipeline()` |
| Discover matching files | `glob()` on supported Node.js |
| Observe possible changes | `watch()` |

---

## 27. Guided live-coding lesson

Create `fs-demo.js`:

```js
const path = require("node:path");
const fs = require("node:fs/promises");

const workspace = path.join(__dirname, "fs-demo-data");
const usersFile = path.join(workspace, "users.json");

async function main() {
  await fs.mkdir(workspace, { recursive: true });

  const users = [
    { id: 1, name: "Ada" },
    { id: 2, name: "Grace" },
  ];

  await fs.writeFile(
    usersFile,
    `${JSON.stringify(users, null, 2)}\n`,
    "utf8"
  );

  const source = await fs.readFile(usersFile, "utf8");
  console.log(JSON.parse(source));

  const stats = await fs.stat(usersFile);
  console.log({ size: stats.size, modified: stats.mtime });

  const entries = await fs.readdir(workspace, { withFileTypes: true });
  for (const entry of entries) {
    console.log(entry.isFile() ? "FILE" : "OTHER", entry.name);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Discuss why each disk operation is awaited, what happens without `utf8`, why JSON needs parsing, and which statements touch the disk rather than only values or strings.

---

## 28. Suggested teaching sequence

Teach this unit over two 90-minute sessions.

### Session 1 ? everyday operations

| Time | Activity |
| --- | --- |
| 0?15 min | Contrast `path` strings with real `fs` operations |
| 15?30 min | Promise, callback, and synchronous styles |
| 30?50 min | Read, write, append, encoding, Buffer, and JSON |
| 50?65 min | `mkdir()`, `readdir()`, `Dirent`, and `stat()` |
| 65?78 min | Errors, codes, and race conditions |
| 78?90 min | Guided coding and exit ticket |

### Session 2 ? production concerns

| Time | Activity |
| --- | --- |
| 0?20 min | Copy, move, remove, flags, and permissions |
| 20?35 min | `FileHandle` and temporary directories |
| 35?50 min | Whole-file methods versus streams |
| 50?62 min | Watchers and glob discovery |
| 62?75 min | JSON concurrency and safer replacement |
| 75?90 min | Security review and pair project |

---

## 29. Review questions

1. What differs between `node:fs` and `node:fs/promises`?
2. Why avoid synchronous methods in HTTP handlers?
3. What does `readFile()` return without an encoding?
4. What does `writeFile()` do to an existing file by default?
5. Why coordinate multiple writes to one file?
6. When should `appendFile()` be used?
7. What does `recursive: true` change for `mkdir()`?
8. What is the advantage of `withFileTypes: true`?
9. How do `stat()` and `lstat()` differ?
10. Why compare `error.code` instead of `error.message`?
11. Why is `access()` before reading discouraged?
12. How do `copyFile()` and `cp()` differ?
13. Which flag prevents overwrite during creation?
14. Why explicitly close a `FileHandle`?
15. When are streams preferable to `readFile()`?
16. Why are watch events not a perfect audit trail?
17. How does `fs.glob()` differ from `path.matchesGlob()`?
18. Why is recursive deletion dangerous?
19. How do `mtime`, `ctime`, and `birthtime` differ?
20. Why is a database safer than shared JSON for concurrent state?

## Key takeaway

Use `node:fs/promises` for clear asynchronous backend code, pair it with `node:path`, handle system errors by code, coordinate modifications, close resources, stream large data, and treat every destructive or user-influenced operation as security-sensitive.
