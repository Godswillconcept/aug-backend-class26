# Student Exercises: Node.js `fs` File System Module

> Aligned with the [official Node.js File System documentation](https://nodejs.org/docs/latest/api/fs.html), reviewed on 5 August 2026. Use Node.js v22.17.0+ for every optional `glob()` exercise; core exercises work on older maintained releases.

## Safety and setup

- Use CommonJS unless your instructor requests ESM.
- Prefer `require("node:fs/promises")` and `async`/`await`.
- Build paths with `node:path`.
- Perform destructive exercises only inside `examples/02-fs-lab/workspace` or a temporary directory you created.
- Never run recursive removal against the repository root, home directory, drive root, or an unresolved user path.
- Predict the result before running each exercise.

From the repository root, initialize the lab:

```bash
node examples/02-fs-lab/setup.js
```

Reset it whenever necessary by running the same command. The setup script only replaces its explicitly defined `workspace` directory.

---

## Part A ? Concepts

### Exercise 1: Classify the API style

For each expression, identify Promise, callback, or synchronous style and describe its return behavior:

```js
fs.readFile("message.txt", "utf8", callback);
await fsPromises.readFile("message.txt", "utf8");
fs.readFileSync("message.txt", "utf8");
```

Which one blocks the event loop? Which import provides each method?

### Exercise 2: Buffer or string?

Predict the type and explain why:

```js
const first = await fs.readFile(filePath);
const second = await fs.readFile(filePath, "utf8");
```

How can the first value be converted to text?

### Exercise 3: Error-first callbacks

Explain the purpose of both callback arguments:

```js
fs.readFile(filePath, "utf8", (error, content) => {
  // ...
});
```

Why must the error be checked before using `content`?

### Exercise 4: Choose an API

Select an appropriate API and justify it:

1. Read a 2 KB configuration file.
2. Send a 4 GB video to a client.
3. Add one line to a log.
4. List entries and distinguish files from directories.
5. Prevent overwriting a newly generated invoice.
6. Inspect a symbolic link itself.
7. Copy a complete directory tree.

---

## Part B ? Reading and writing

### Exercise 5: Read text

Read `workspace/message.txt` as UTF-8 and print:

```text
Characters: <count>
Words: <count>
Uppercase: <content>
```

Split words on whitespace and ignore empty entries.

### Exercise 6: Observe a Buffer

Read the same file without an encoding. Print:

- whether it is a Buffer;
- its byte length;
- the text produced by `.toString("utf8")`.

Explain why character count and byte length are not always identical for Unicode text.

### Exercise 7: Read and validate JSON

Create `readJson(filePath)` that:

- reads UTF-8;
- parses JSON;
- returns the JavaScript value;
- lets unexpected errors propagate.

Test `workspace/users.json` and `workspace/invalid.json`. In the caller, report invalid JSON separately from a missing file.

### Exercise 8: Write a report

Create `workspace/output/summary.txt`. The output directory may not exist. The file must contain:

```text
Backend Class Summary
Student count: 3
Generated: <ISO timestamp>
```

Run the code twice. Explain why the file is replaced rather than duplicated.

### Exercise 9: Append an audit log

Write `recordAction(action)` that appends one ISO-dated line to `workspace/logs/audit.log`. Ensure the directory exists. Call it three times sequentially and read the final result.

### Exercise 10: Exclusive creation

Create `workspace/output/invoice-1001.json` with flag `wx`. Run it twice and handle `EEXIST` with a friendly message. Explain why `existsSync()` followed by `writeFile()` would be weaker.

---

## Part C ? Directories and metadata

### Exercise 11: Recursive directory creation

Create:

```text
workspace/uploads/users/42/avatars
```

Use one `mkdir()` call. Run it twice without failure.

### Exercise 12: Directory inventory

Use `readdir(..., { withFileTypes: true })` on `workspace`. Produce:

```js
{
  files: [/* sorted names */],
  directories: [/* sorted names */],
  symbolicLinks: [/* sorted names */],
  other: [/* sorted names */]
}
```

Do not call `stat()` for each entry.

### Exercise 13: File information helper

Write `describeEntry(filePath)` returning:

```js
{
  path: "absolute path",
  type: "file" | "directory" | "symbolic-link" | "other",
  size: 0,
  modifiedAt: "ISO date"
}
```

Use `lstat()` so a symbolic link is described as a link instead of its target. Test files and directories. Skip link creation if local permissions prevent it.

### Exercise 14: Recursive listing

On a supported Node.js release, list all names below `workspace/documents` with `readdir({ recursive: true })`. Sort the result. Then explain when `opendir()` may be a better choice.

### Exercise 15: Latest file

Given a directory, use `readdir({ withFileTypes: true })`, `stat()`, and `Promise.all()` to find its most recently modified regular file. Ignore directories. Return `null` when no file exists.

---

## Part D ? Copying, moving, and deletion

### Exercise 16: Backup one file

Copy `workspace/users.json` to `workspace/backups/users.json`. Create the destination directory first. Then use `COPYFILE_EXCL` and observe the second attempt.

### Exercise 17: Copy a tree

Copy `workspace/documents` to `workspace/backups/documents` using `cp()` with `recursive: true`. Configure it to reject an existing destination instead of silently overwriting.

### Exercise 18: Rename a file

Rename `workspace/drafts/article.txt` to `workspace/published/article.txt`. Create the destination directory. Explain why `rename()` may fail for a cross-device move.

### Exercise 19: Remove safely

Write `removeGeneratedDirectory(target)` that only removes a target when its resolved path is inside the lab `workspace/generated` directory. Reject the base's parent, sibling directories, and unrelated absolute paths. Use `rm({ recursive: true, force: true })` only after containment succeeds.

Test accepted and rejected paths without deleting anything outside the lab.

### Exercise 20: Delete a missing file

Call `unlink()` on a missing file. Treat `ENOENT` as an already-achieved result while rethrowing every other error. What changes if `rm(file, { force: true })` is used instead?

---

## Part E ? Errors, flags, and handles

### Exercise 21: Friendly file reader

Implement `readText(filePath)` returning:

- file text on success;
- `null` on `ENOENT`;
- a friendly custom error on `EACCES` or `EPERM`;
- the original error for all other cases.

Do not compare error messages.

### Exercise 22: Explain the race

Debug this code:

```js
await fs.access(filePath);
const content = await fs.readFile(filePath, "utf8");
```

Explain the race and rewrite it without a pre-check.

### Exercise 23: FileHandle lifecycle

Open `workspace/logs/handle.log` in append mode. Append two lines, obtain its `Stats`, print the size, and close it in `finally`. Demonstrate why `close()` belongs in `finally` by throwing an intentional error after the first append.

### Exercise 24: Truncate

Write `ABCDEFGHIJ` to a lab file. Call `truncate()` with lengths `4` and then `8`, reading after each call. Record the content and byte lengths. What fills the extended portion?

### Exercise 25: Permissions discussion

Explain `0o644` and `0o755`. On POSIX, create a small script and apply `0o755`. On Windows, research/observe which permission behavior is not equivalent. Do not assume `chmod()` is portable authorization.

---

## Part F ? Streams, watching, and globbing

### Exercise 26: Stream copy

Copy `workspace/documents/large.txt` with `createReadStream()`, `createWriteStream()`, and `pipeline()`. Compare the source and destination sizes after completion.

### Exercise 27: Count lines incrementally

Use a read stream and `node:readline` to count non-empty lines in `large.txt` without loading the complete file into memory.

### Exercise 28: Watch briefly

Watch `workspace/watch-area` with `fsPromises.watch()` and an `AbortController`. Stop after five seconds. In another operation, create and modify a file. Log events, then explain why exact event counts and names are platform-dependent.

### Exercise 29: Discover JavaScript files

If `fs.glob()` is available, discover `**/*.js` below `workspace/source`, excluding `**/*.test.js`. Print sorted results. State the versions in which `glob()` was added and marked stable.

### Exercise 30: `fs.glob()` versus `path.matchesGlob()`

Write two sentences and one code example demonstrating the difference between discovering files on disk and testing one string against a pattern.

---

## Part G ? Pair project: JSON task repository

Build `task-repository.js` with:

```js
initialize()
getAll()
getById(id)
create(title)
update(id, changes)
remove(id)
backup()
```

Requirements:

- Store data inside a configurable lab directory, never beside source by accident.
- Initialize missing directories and a `tasks.json` containing `[]`.
- Validate parsed data is an array.
- Generate unique IDs without relying on array length.
- Store `createdAt` and `updatedAt` ISO dates.
- Reject empty titles.
- Throw a clear not-found error for missing IDs.
- Serialize mutations through a Promise queue or equivalent single-process lock.
- Save by writing a sibling temporary file and renaming it.
- Clean up a failed temporary file.
- Back up without overwriting an existing backup.
- Export with CommonJS.
- Test with `node:assert/strict` in a newly created temporary directory.
- Close or clean every resource even when a test fails.

### Marking guide ? 30 marks

| Area | Marks |
| --- | ---: |
| Correct Promise-based `fs` usage | 5 |
| Path construction and containment | 3 |
| Initialization and validation | 4 |
| CRUD behavior | 5 |
| Serialized, safer writes | 5 |
| Error handling | 3 |
| Backup behavior | 2 |
| Automated tests and cleanup | 3 |

---

## Exit ticket

1. Which import is recommended for `async`/`await` file operations?
2. What does `readFile()` return without an encoding?
3. Which option makes nested `mkdir()` repeatable?
4. Which property should be checked for `ENOENT`?
5. Which open flag prevents overwrite?
6. Why must `FileHandle` be closed?
7. Which technique should handle a very large file?
8. Does `fs.watch()` guarantee one event per change?
9. Why is pre-checking with `access()` often discouraged?
10. What must be verified before recursive deletion?
