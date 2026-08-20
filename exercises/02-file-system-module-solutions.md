# Instructor Guide and Solutions: Node.js `fs`

> Based on the [official Node.js File System documentation](https://nodejs.org/docs/latest/api/fs.html), reviewed on 5 August 2026. Keep this file separate during assessed work. Paths, timestamps, event counts, permissions, and some error codes vary by platform.

All snippets assume:

```js
const path = require("node:path");
const fs = require("node:fs/promises");
const fsSync = require("node:fs");

const labRoot = path.resolve(__dirname, "../examples/02-fs-lab/workspace");
```

## Part A solutions

### Exercise 1

- `fs.readFile(..., callback)` is callback-based and returns `undefined`; the callback later receives the result.
- `await fsPromises.readFile(...)` awaits a Promise.
- `fs.readFileSync(...)` returns directly and blocks the event loop.
- Callback and Sync methods come from `node:fs`; Promise methods come from `node:fs/promises`.

### Exercise 2

The first result is a `Buffer`; the second is a string. Convert with `first.toString("utf8")`. Byte length can exceed character count because UTF-8 encodes some characters with multiple bytes.

### Exercise 3

`error` describes failure and must be handled first. On failure, `content` is not a successful result. The first-argument error convention is consistent across callback `fs` APIs.

### Exercise 4

1. `readFile()`
2. `createReadStream()`
3. `appendFile()`
4. `readdir({ withFileTypes: true })`
5. `writeFile(..., { flag: "wx" })`
6. `lstat()`
7. `cp(..., { recursive: true })`

## Part B solutions

### Exercise 5

```js
const filePath = path.join(labRoot, "message.txt");
const content = await fs.readFile(filePath, "utf8");
const words = content.trim().split(/\s+/).filter(Boolean);

console.log("Characters:", content.length);
console.log("Words:", words.length);
console.log("Uppercase:", content.toUpperCase());
```

### Exercise 6

```js
const data = await fs.readFile(path.join(labRoot, "message.txt"));

console.log(Buffer.isBuffer(data));
console.log(data.length);
console.log(data.toString("utf8"));
```

### Exercise 7

```js
async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function demonstrate(name) {
  try {
    console.log(await readJson(path.join(labRoot, name)));
  } catch (error) {
    if (error.code === "ENOENT") console.log("Missing file:", name);
    else if (error instanceof SyntaxError) console.log("Invalid JSON:", name);
    else throw error;
  }
}
```

### Exercise 8

```js
const outputDirectory = path.join(labRoot, "output");
await fs.mkdir(outputDirectory, { recursive: true });

const report = [
  "Backend Class Summary",
  "Student count: 3",
  `Generated: ${new Date().toISOString()}`,
  "",
].join("\n");

await fs.writeFile(path.join(outputDirectory, "summary.txt"), report, "utf8");
```

Default flag `w` truncates an existing file.

### Exercise 9

```js
async function recordAction(action) {
  const logs = path.join(labRoot, "logs");
  await fs.mkdir(logs, { recursive: true });
  await fs.appendFile(
    path.join(logs, "audit.log"),
    `${new Date().toISOString()} ${action}\n`,
    "utf8"
  );
}

await recordAction("created user");
await recordAction("updated user");
await recordAction("deleted user");
```

### Exercise 10

```js
try {
  await fs.writeFile(
    path.join(labRoot, "output", "invoice-1001.json"),
    "{}\n",
    { flag: "wx" }
  );
} catch (error) {
  if (error.code === "EEXIST") console.log("Invoice already exists");
  else throw error;
}
```

The exclusive open and creation are one operation; a separate existence check creates a race window.

## Part C solutions

### Exercise 11

```js
await fs.mkdir(path.join(labRoot, "uploads", "users", "42", "avatars"), {
  recursive: true,
});
```

### Exercise 12

```js
async function inventory(directory) {
  const result = { files: [], directories: [], symbolicLinks: [], other: [] };
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile()) result.files.push(entry.name);
    else if (entry.isDirectory()) result.directories.push(entry.name);
    else if (entry.isSymbolicLink()) result.symbolicLinks.push(entry.name);
    else result.other.push(entry.name);
  }

  for (const values of Object.values(result)) values.sort();
  return result;
}
```

### Exercise 13

```js
async function describeEntry(inputPath) {
  const absolutePath = path.resolve(inputPath);
  const stats = await fs.lstat(absolutePath);

  let type = "other";
  if (stats.isFile()) type = "file";
  else if (stats.isDirectory()) type = "directory";
  else if (stats.isSymbolicLink()) type = "symbolic-link";

  return {
    path: absolutePath,
    type,
    size: stats.size,
    modifiedAt: stats.mtime.toISOString(),
  };
}
```

### Exercise 14

```js
const names = await fs.readdir(path.join(labRoot, "documents"), {
  recursive: true,
});
console.log(names.sort());
```

`opendir()` is better when a huge tree should be processed incrementally rather than accumulated into one array.

### Exercise 15

```js
async function latestFile(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile());

  const candidates = await Promise.all(
    files.map(async (entry) => {
      const filePath = path.join(directory, entry.name);
      return { filePath, stats: await fs.stat(filePath) };
    })
  );

  candidates.sort((a, b) => b.stats.mtimeMs - a.stats.mtimeMs);
  return candidates[0]?.filePath ?? null;
}
```

## Part D solutions

### Exercise 16

```js
const { constants } = require("node:fs");
const backupDirectory = path.join(labRoot, "backups");
await fs.mkdir(backupDirectory, { recursive: true });

await fs.copyFile(
  path.join(labRoot, "users.json"),
  path.join(backupDirectory, "users.json"),
  constants.COPYFILE_EXCL
);
```

The second attempt rejects with `EEXIST` on typical platforms.

### Exercise 17

```js
await fs.cp(
  path.join(labRoot, "documents"),
  path.join(labRoot, "backups", "documents"),
  { recursive: true, force: false, errorOnExist: true }
);
```

### Exercise 18

```js
const published = path.join(labRoot, "published");
await fs.mkdir(published, { recursive: true });
await fs.rename(
  path.join(labRoot, "drafts", "article.txt"),
  path.join(published, "article.txt")
);
```

A different device may reject `rename()` with `EXDEV`; copy and then delete only after a successful copy.

### Exercise 19

```js
function resolveInside(baseDirectory, requestedPath) {
  const base = path.resolve(baseDirectory);
  const candidate = path.resolve(base, requestedPath);
  const relative = path.relative(base, candidate);

  const escapes =
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative);

  if (escapes) throw new Error("Target escapes generated directory");
  return candidate;
}

async function removeGeneratedDirectory(target) {
  const base = path.join(labRoot, "generated");
  const candidate = resolveInside(base, target);
  if (candidate === path.resolve(base)) {
    throw new Error("Refusing to remove the generated root itself");
  }
  await fs.rm(candidate, { recursive: true, force: true });
}
```

### Exercise 20

```js
async function unlinkIfPresent(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
```

`rm(filePath, { force: true })` already ignores a missing target, but explicit handling is useful when other failure codes need distinct behavior.

## Part E solutions

### Exercise 21

```js
async function readText(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return null;
    if (error.code === "EACCES" || error.code === "EPERM") {
      const friendly = new Error("The file cannot be read with current permissions");
      friendly.cause = error;
      throw friendly;
    }
    throw error;
  }
}
```

### Exercise 22

```js
try {
  const content = await fs.readFile(filePath, "utf8");
  console.log(content);
} catch (error) {
  if (error.code === "ENOENT") console.log("File is missing");
  else throw error;
}
```

The entry can change after `access()` succeeds but before `readFile()` begins.

### Exercise 23

```js
const logs = path.join(labRoot, "logs");
await fs.mkdir(logs, { recursive: true });
const handle = await fs.open(path.join(logs, "handle.log"), "a");

try {
  await handle.appendFile("first\n");
  // throw new Error("Intentional demonstration");
  await handle.appendFile("second\n");
  console.log((await handle.stat()).size);
} finally {
  await handle.close();
}
```

### Exercise 24

```js
const filePath = path.join(labRoot, "output", "truncate.txt");
await fs.writeFile(filePath, "ABCDEFGHIJ");
await fs.truncate(filePath, 4);
console.log(await fs.readFile(filePath, "utf8")); // ABCD
await fs.truncate(filePath, 8);
const data = await fs.readFile(filePath);
console.log(data.length, data); // extended with zero bytes
```

### Exercise 25

`0o644` means owner read/write and group/others read. `0o755` means owner read/write/execute and group/others read/execute. Windows permission behavior is not equivalent to POSIX mode bits.

## Part F solutions

### Exercise 26

```js
const { pipeline } = require("node:stream/promises");
const source = path.join(labRoot, "documents", "large.txt");
const destination = path.join(labRoot, "output", "large-copy.txt");
await fs.mkdir(path.dirname(destination), { recursive: true });
await pipeline(
  fsSync.createReadStream(source),
  fsSync.createWriteStream(destination)
);
console.log((await fs.stat(source)).size === (await fs.stat(destination)).size);
```

### Exercise 27

```js
const readline = require("node:readline");
const input = fsSync.createReadStream(
  path.join(labRoot, "documents", "large.txt"),
  "utf8"
);
const lines = readline.createInterface({ input, crlfDelay: Infinity });
let count = 0;
for await (const line of lines) if (line.trim()) count += 1;
console.log(count);
```

### Exercise 28

```js
const area = path.join(labRoot, "watch-area");
await fs.mkdir(area, { recursive: true });
const controller = new AbortController();
setTimeout(() => controller.abort(), 5_000);

setTimeout(async () => {
  await fs.writeFile(path.join(area, "demo.txt"), "one");
  await fs.appendFile(path.join(area, "demo.txt"), "two");
}, 250);

try {
  for await (const event of fs.watch(area, { signal: controller.signal })) {
    console.log(event);
  }
} catch (error) {
  if (error.name !== "AbortError") throw error;
}
```

### Exercise 29

```js
const matches = [];
for await (const file of fs.glob("**/*.js", {
  cwd: path.join(labRoot, "source"),
  exclude: ["**/*.test.js"],
})) {
  matches.push(file);
}
console.log(matches.sort());
```

Added in v22.0.0; stable in v22.17.0 and v24.0.0.

### Exercise 30

```js
for await (const entry of fs.glob("src/**/*.js")) console.log(entry);
console.log(path.matchesGlob("src/app.js", "src/**/*.js"));
```

The first discovers entries; the second tests one string and does not access the disk.

## Pair-project design guidance

Use a closure that stores `directory`, `tasksFile`, and a mutation queue:

```js
function createTaskRepository(directory) {
  const tasksFile = path.join(directory, "tasks.json");
  let mutationQueue = Promise.resolve();

  function serialize(operation) {
    const result = mutationQueue.then(operation, operation);
    mutationQueue = result.catch(() => {});
    return result;
  }

  // initialize/read/validate/writeAtomically/CRUD functions belong here.
  return { /* exported operations */ };
}
```

Important review points:

- `initialize()` uses `mkdir({ recursive: true })` and exclusive creation, treating only `EEXIST` as harmless.
- Reads verify the parsed value is an array.
- Mutations run through `serialize()` to prevent lost updates in one process.
- IDs can use `crypto.randomUUID()`.
- Atomic save writes a unique sibling temporary file with `wx`, renames it, and cleans it on failure.
- Tests create a directory with `mkdtemp(path.join(os.tmpdir(), "task-repo-"))` and remove only that resolved directory in `finally`.
- This queue does not coordinate other processes. Use a database for real concurrent shared state.

## Exit-ticket answers

1. `require("node:fs/promises")`
2. A `Buffer`
3. `{ recursive: true }`
4. `error.code`
5. `wx` (or another exclusive `x` flag appropriate to the operation)
6. To release the descriptor reliably and avoid leaks
7. Streams with backpressure
8. No
9. The entry can change between check and operation
10. The resolved target is the exact intended, safely contained location
