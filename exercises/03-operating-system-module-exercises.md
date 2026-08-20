# Student Exercises: Node.js `os` Module

> Aligned with the [official Node.js OS documentation](https://nodejs.org/docs/latest/api/os.html), reviewed on 10 August 2026. Outputs are machine-dependent. Do not copy another student's exact output as an expected result.

## Instructions

- Use CommonJS: `const os = require("node:os")`.
- Run each script with `node filename.js`.
- Predict the result's **type and shape** before running it.
- Do not expose usernames, home paths, MAC addresses, or private addresses in screenshots submitted publicly.
- Avoid calling `os.setPriority()` unless an exercise explicitly requests it and the instructor approves.

---

## Part A — Platform identity

### Exercise 1: Basic system card

Create `system-card.js` that prints:

```js
{
  platform: "...",
  type: "...",
  release: "...",
  version: "...",
  architecture: "...",
  machine: "...",
  hostname: "..."
}
```

Under the output, explain the difference between each field.

### Exercise 2: Platform mapping

Write `friendlyPlatformName(platform)` returning:

- `Windows` for `win32`;
- `macOS` for `darwin`;
- `Linux` for `linux`;
- `Other (<value>)` for everything else.

Test the function with literal values rather than depending only on your current system.

### Exercise 3: Architecture investigation

Print `os.arch()`, `process.arch`, and `os.machine()`. Answer:

1. Which two should be equal?
2. What layer does `machine()` describe?
3. Give one situation in which the values can differ.

### Exercise 4: Avoid brittle tests

Write assertions for `platform()`, `type()`, `release()`, `version()`, and `arch()` without hard-coding your machine's values. Validate types, non-empty strings, and membership in the documented platform list where appropriate.

---

## Part B — Platform paths and text

### Exercise 5: EOL inspection

Print these values with `JSON.stringify()`:

```js
os.EOL
"\n"
"\r\n"
```

Why is `JSON.stringify()` useful here? Create three lines joined with `os.EOL`, then split a mixed-platform string with `/\r?\n/`.

### Exercise 6: Null device

Print `os.devNull`. Use `createWriteStream()` to write a sentence to it and wait for the stream to finish. Explain why no ordinary output file appears.

### Exercise 7: Temporary directory

Use `os.tmpdir()`, `path.join()`, and `fs.mkdtemp()` to create a unique temporary directory with prefix `os-class-`. Write a small file inside it, read it, and remove the directory in `finally`.

Explain why `os.tmpdir()` should not store permanent application data.

### Exercise 8: Home directory comparison

Compare `os.homedir()` with `os.userInfo().homedir`. Print only whether they are equal; do not display the paths in public output. Explain why they can differ.

---

## Part C — Memory and uptime

### Exercise 9: Format bytes

Write `formatBytes(bytes)` supporting B, KiB, MiB, GiB, and TiB. Test it with:

```js
0
1024
1024 ** 2
5.5 * 1024 ** 3
os.totalmem()
os.freemem()
```

### Exercise 10: Memory report

Return:

```js
{
  totalBytes,
  freeBytes,
  usedBytes,
  freePercent,
  usedPercent
}
```

Requirements:

- percentages must be numbers rounded to one decimal place;
- used plus free should approximately equal total;
- each percentage must be between 0 and 100.

Why is this not the Node.js process heap usage?

### Exercise 11: System versus process memory

Print a comparison containing `os.totalmem()`, `os.freemem()`, and selected fields from `process.memoryUsage()`. Explain the scope and units of each.

### Exercise 12: Format duration

Write `formatDuration(seconds)` returning days, hours, minutes, and seconds. Test boundary cases:

```text
0
59
60
3599
3600
86399
86400
os.uptime()
```

### Exercise 13: Two uptimes

Print system uptime and process uptime in a human-friendly format. Explain why the system value will normally be larger and identify an environment where it might be unexpectedly small.

---

## Part D — CPU and parallelism

### Exercise 14: CPU summary

Using `os.cpus()`, produce:

```js
{
  logicalCpuCount,
  models: [/* unique model strings */],
  averageReportedMHz,
  totalIdleMilliseconds
}
```

Handle an empty CPU array without dividing by zero.

### Exercise 15: Select worker count

Write `chooseWorkerCount({ reserve = 1, maximum = Infinity })` using `os.availableParallelism()`.

Rules:

- result is at least 1;
- subtract `reserve` but never fall below 1;
- never exceed `maximum`;
- validate that `reserve` is non-negative and `maximum` is at least 1.

Explain why `os.cpus().length` is not the preferred source.

### Exercise 16: CPU utilization sampling

CPU `times` values are cumulative. Write:

```js
snapshotCpuTimes()
calculateCpuUsage(before, after)
```

Take two samples approximately one second apart. For each logical CPU, calculate the percentage of the elapsed counter time that was not idle.

Discuss why results vary and why this remains a simple estimate.

### Exercise 17: Load average

Print 1-, 5-, and 15-minute load averages and normalize each by `os.availableParallelism()`.

Answer:

1. What does Windows return?
2. Why is load not a CPU percentage?
3. Why should portable monitoring identify the platform before interpreting it?

### Exercise 18: Endianness

Print `os.endianness()`. Create a 4-byte Buffer, write `0x12345678` using `writeUInt32LE()`, and display its bytes. Repeat with `writeUInt32BE()` and explain the difference.

---

## Part E — Network and user information

### Exercise 19: External IPv4 addresses

Write `getExternalIPv4Addresses()` returning objects shaped like:

```js
{
  interfaceName: "...",
  address: "...",
  cidr: "...",
  mac: "..."
}
```

Filter out internal and IPv6 entries. Do not assume at least one result.

### Exercise 20: Safe network summary

Build a privacy-reduced summary that reports only:

- number of interface names;
- IPv4 address count;
- IPv6 address count;
- internal address count;
- external address count.

Do not return addresses, MAC values, usernames, or hostnames.

### Exercise 21: User information redaction

Write `getRedactedUserInfo()` returning:

```js
{
  hasUsername: true,
  hasHomeDirectory: true,
  hasShell: true,
  uidAvailable: true,
  gidAvailable: true
}
```

On Windows, correctly interpret `shell: null` and IDs of `-1`.

### Exercise 22: Hostname assumptions

List four reasons `os.hostname()` should not be used as a permanent globally unique application instance ID. Propose a better alternative.

---

## Part F — Priority, constants, and applied work

### Exercise 23: Read priority safely

Print the current process priority and all entries in `os.constants.priority`. Do not change priority. Explain why setting `-20` is not the same as making a process less important.

### Exercise 24: Constants inventory

Write a summary containing the number of available signal, error, priority, and `dlopen` constants. Your code must tolerate a missing category.

Explain why named constants are preferable to copied numeric values.

### Exercise 25: Safe diagnostic report

Create `getDiagnosticReport()` that includes:

- platform, type, release, architecture, and machine;
- total/free/used memory in GiB;
- system uptime;
- available parallelism and logical CPU count;
- load averages only when not Windows;
- temporary directory basename, not the full path;
- counts of network addresses, without addresses or MAC values.

Write it as formatted JSON to `diagnostic-report.json` using the File System module. Add a warning comment explaining why this file should not be served publicly without review.

---

## Part G — Pair project: System health snapshot

Build these files:

```text
system-health.js
system-health.test.js
```

Export:

```js
formatBytes(bytes)
formatDuration(seconds)
getMemorySnapshot()
getCpuSnapshot()
getNetworkCounts()
getSystemHealth()
```

Requirements:

- Use dependency injection so tests can pass a fake `os` object.
- Do not expose usernames, home paths, hostnames, addresses, or MAC values.
- Use `availableParallelism()` for recommended parallelism.
- Handle an empty `cpus()` array.
- Treat Windows load averages as unsupported rather than as real zero load.
- Return plain JSON-serializable values.
- Validate numbers and avoid division by zero.
- Test with `node:assert/strict`.
- Include Windows, Linux, zero-memory, empty-CPU, and multiple-network-interface test cases.

### Marking guide — 25 marks

| Area | Marks |
| --- | ---: |
| Correct OS API use | 5 |
| Cross-platform behavior | 4 |
| Unit conversion and validation | 4 |
| Privacy-conscious output | 3 |
| Dependency injection/design | 3 |
| Automated tests and edge cases | 5 |
| Code clarity | 1 |

---

## Exit ticket

1. What does `os.platform()` return on Windows?
2. Which method estimates usable parallelism?
3. What unit do memory methods return?
4. How does `os.uptime()` differ from `process.uptime()`?
5. What does `os.loadavg()` return on Windows?
6. Is `os.EOL` a property or method?
7. Which API gives the portable null-device path?
8. Why can `homedir()` and `userInfo().homedir` differ?
9. Does a local network address reveal the public internet address?
10. Name two OS values that should be redacted from public diagnostics.
