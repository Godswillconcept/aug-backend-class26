# Node.js Built-in Modules: The `os` Operating System Module

> Documentation basis: [official Node.js OS API documentation](https://nodejs.org/docs/latest/api/os.html), reviewed on 10 August 2026. The official page reports Node.js v26.5.0 and marks `node:os` as **Stability: 2 — Stable**.

## Lesson overview

The `node:os` module exposes information and utilities supplied by the operating system. It can describe the platform and processor architecture, report memory and CPU information, identify the current user and host, locate home and temporary directories, inspect network interfaces, report system uptime and load averages, and expose operating-system constants.

Most `os` methods are synchronous because they return small pieces of system information rather than performing general file operations. They do not use callbacks or Promises.

> `node:os` describes the machine or runtime environment visible to the Node.js process. Containers, virtual machines, permissions, environment variables, quotas, and operating-system support can affect the result.

### Learning objectives

By the end of this lesson, students should be able to:

1. Import and use `node:os` with CommonJS and ES modules.
2. Distinguish platform, type, release, version, architecture, and machine type.
3. Convert byte and second values into human-friendly units.
4. Select safe worker concurrency with `availableParallelism()`.
5. Inspect CPU models and cumulative CPU-time counters correctly.
6. Understand free and total memory values without confusing them with Node.js heap usage.
7. identify home, temporary, hostname, user, and network information.
8. Handle Windows and POSIX differences in EOL, load averages, user data, and priorities.
9. Avoid exposing sensitive machine information to clients or logs.
10. Build a reusable system-information report.

---

## 1. Importing `node:os`

No npm installation is required.

### CommonJS

```js
const os = require("node:os");
```

Named destructuring is possible:

```js
const { platform, arch, totalmem } = require("node:os");
```

### ES modules

```js
import os from "node:os";
```

Or:

```js
import { platform, arch, totalmem } from "node:os";
```

### First inspection

```js
console.log({
  platform: os.platform(),
  architecture: os.arch(),
  hostname: os.hostname(),
  home: os.homedir(),
  temporaryDirectory: os.tmpdir(),
});
```

Outputs differ between machines. Tests should normally check the value's shape or type instead of hard-coding your computer's exact result.

---

## 2. `os.platform()` — compiled operating-system platform

```js
const currentPlatform = os.platform();
console.log(currentPlatform);
```

Common values include:

| Value | Operating system family |
| --- | --- |
| `win32` | Windows, including 64-bit Windows |
| `linux` | Linux |
| `darwin` | macOS |
| `freebsd` | FreeBSD |
| `openbsd` | OpenBSD |
| `aix` | IBM AIX |
| `sunos` | SunOS/illumos family |

Android may be returned by an experimental Android build.

Important details:

- The value identifies the platform for which the Node.js binary was compiled.
- `win32` does not mean that Windows is 32-bit.
- The value is equivalent to `process.platform`.
- Use it only when behavior truly must differ by platform.

```js
const command = os.platform() === "win32" ? "dir" : "ls";
```

Prefer portable Node.js APIs over platform branches whenever possible.

---

## 3. `os.type()`, `os.release()`, and `os.version()`

These methods answer related but different questions.

```js
console.log("Type:", os.type());
console.log("Release:", os.release());
console.log("Version:", os.version());
```

### `os.type()`

Returns the operating-system name. Common examples:

- `Linux` on Linux;
- `Darwin` on macOS;
- `Windows_NT` on Windows.

### `os.release()`

Returns an operating-system release identifier. On POSIX it is derived from `uname(3)`; on Windows it is obtained through Windows version APIs.

### `os.version()`

Returns a string identifying the kernel version. It was added in Node.js v12.17.0 and v13.11.0.

Do not parse these free-form strings unless unavoidable. Feature detection or documented platform APIs are usually more robust than version-string assumptions.

---

## 4. `os.arch()` and `os.machine()`

### `os.arch()`

Returns the CPU architecture for which the running Node.js binary was compiled.

```js
console.log(os.arch());
```

Possible documented values include `arm`, `arm64`, `ia32`, `loong64`, `mips`, `mipsel`, `ppc64`, `riscv64`, `s390x`, and `x64`. It is equivalent to `process.arch`.

### `os.machine()`

Returns the operating system's machine type, such as `x86_64`, `aarch64`, `arm64`, `i386`, or `ppc64le`.

```js
console.log(os.machine());
```

It was added in Node.js v16.18.0 and v18.9.0.

### Why can they differ?

A 32-bit Node.js binary can run on a 64-bit operating system. In such a case, the compiled Node architecture and the machine type can describe different layers.

Use `arch()` when choosing a native binary compatible with the current Node.js process. Use `machine()` when the operating system's machine type is the relevant fact.

---

## 5. `os.EOL` — platform end-of-line marker

`os.EOL` is a string property, not a function.

```js
console.log(JSON.stringify(os.EOL));
```

- POSIX: `\n`
- Windows: `\r\n`

```js
const lines = ["first", "second", "third"];
const platformText = lines.join(os.EOL);
```

Use `os.EOL` when generating a file that should follow the host platform's convention. For network protocols and standardized formats, use the delimiter required by that format instead. Git repositories commonly standardize text on `\n` regardless of the developer's OS.

When reading text, code often needs to accept both forms:

```js
const linesFromAnyPlatform = text.split(/\r?\n/);
```

---

## 6. `os.devNull` — null device path

`os.devNull` is the platform-specific path of the null device:

- `/dev/null` on POSIX;
- `\\.\nul` on Windows.

```js
console.log(os.devNull);
```

Data written to the null device is discarded. Reading normally behaves like an empty stream.

```js
const fs = require("node:fs");
const discard = fs.createWriteStream(os.devNull);
discard.end("This data is intentionally discarded.");
```

`os.devNull` was added in Node.js v14.18.0 and v16.3.0. Prefer it over hard-coding `/dev/null` or a Windows path.

---

## 7. `os.hostname()`

```js
const hostname = os.hostname();
console.log(hostname);
```

This returns the operating system's host name. It is useful in internal diagnostics, distributed-worker identification, and logs.

Do not assume it is:

- globally unique;
- a public DNS name;
- stable across container restarts;
- safe to expose to untrusted clients.

Containers often provide generated hostnames. Use an application instance ID when durable uniqueness is required.

---

## 8. `os.homedir()` and `os.userInfo()`

### `os.homedir()`

Returns the current user's home-directory path.

```js
console.log(os.homedir());
```

Resolution rules from the official documentation:

- POSIX checks the `HOME` environment variable, then uses the effective user ID.
- Windows checks `USERPROFILE`, then falls back to the profile directory.

### `os.userInfo([options])`

```js
const user = os.userInfo();
console.log(user);
```

The returned object contains:

```js
{
  username,
  uid,
  gid,
  shell,
  homedir
}
```

On Windows, `uid` and `gid` are `-1`, and `shell` is `null`. With `{ encoding: "buffer" }`, textual values are Buffers.

`os.userInfo().homedir` comes from the operating system. `os.homedir()` first checks environment variables, so the values can differ.

Usernames, home paths, IDs, and shells are potentially sensitive. Do not return the complete object from a public health endpoint.

---

## 9. `os.tmpdir()` — temporary directory

```js
const temporaryRoot = os.tmpdir();
console.log(temporaryRoot);
```

It returns the operating system's preferred temporary directory without a trailing separator.

Environment-variable precedence:

- Windows: `TEMP`, then `TMP`, then a Windows system temp directory.
- Non-Windows: `TMPDIR`, then `TMP`, then `TEMP`, then `/tmp`.

Use it with `path.join()` or `fs.mkdtemp()`:

```js
const path = require("node:path");
const fs = require("node:fs/promises");

const prefix = path.join(os.tmpdir(), "backend-class-");
const directory = await fs.mkdtemp(prefix);
```

The system temp directory is shared and can be cleaned externally. Do not treat it as permanent storage. Generate unpredictable names, use safe permissions, and remove temporary resources when finished.

---

## 10. `os.totalmem()` and `os.freemem()`

Both return bytes as integers.

```js
const totalBytes = os.totalmem();
const freeBytes = os.freemem();
const usedBytes = totalBytes - freeBytes;
```

Human-readable conversion:

```js
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";

  const units = ["B", "KiB", "MiB", "GiB", "TiB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  return `${(bytes / 1024 ** index).toFixed(2)} ${units[index]}`;
}
```

```js
console.log({
  total: formatBytes(totalBytes),
  free: formatBytes(freeBytes),
  used: formatBytes(usedBytes),
  usedPercent: ((usedBytes / totalBytes) * 100).toFixed(1),
});
```

These values describe system memory visible to the process, not just the Node.js heap. Use `process.memoryUsage()` for the current process. Containers and host accounting can affect what is reported.

One sample is not a monitoring system. Memory values change continuously.

---

## 11. `os.uptime()`

Returns system uptime in seconds.

```js
const seconds = os.uptime();
```

Format it:

```js
function formatDuration(totalSeconds) {
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

console.log(formatDuration(os.uptime()));
```

Do not confuse system uptime with application uptime. `process.uptime()` reports how long the current Node.js process has run.

---

## 12. `os.cpus()` — logical CPU information

Returns an array describing each logical CPU core visible to the process. It can be empty if CPU information is unavailable.

```js
const cpus = os.cpus();
console.log(cpus.length);
console.log(cpus[0]);
```

Each object includes:

- `model`: processor model string;
- `speed`: reported speed in MHz;
- `times.user`: cumulative milliseconds in user mode;
- `times.nice`: cumulative milliseconds in nice mode;
- `times.sys`: cumulative milliseconds in system mode;
- `times.idle`: cumulative idle milliseconds;
- `times.irq`: cumulative interrupt-request time.

On Windows, `nice` is always zero.

The `times` values are cumulative counters since system startup, not percentages. Calculating CPU utilization requires two samples separated by time and comparing their differences.

Do not use `os.cpus().length` to decide application parallelism. The official documentation explicitly directs applications to `os.availableParallelism()`.

---

## 13. `os.availableParallelism()`

```js
const suggestedWorkers = os.availableParallelism();
console.log(suggestedWorkers);
```

It returns an estimate of the default parallelism an application should use and always returns an integer greater than zero. It wraps libuv's `uv_available_parallelism()`.

It was added in Node.js v18.14.0 and v19.4.0.

Why it is preferable:

- logical CPU count may not reflect CPU affinity;
- containers can restrict usable CPUs;
- process constraints may differ from host hardware;
- the operating system and libuv can provide a better usable estimate.

It is still an estimate, not an instruction to always create that many threads. Workload type, memory, external services, and rate limits also matter.

```js
const workerCount = Math.max(1, os.availableParallelism() - 1);
```

Leaving one unit free may help on a developer machine, but it is an application policy rather than a universal rule.

---

## 14. `os.loadavg()`

```js
const [oneMinute, fiveMinutes, fifteenMinutes] = os.loadavg();
```

Load average is a Unix-specific measure of system activity. The three values represent 1-, 5-, and 15-minute averages.

On Windows, the result is always:

```js
[0, 0, 0]
```

Load average is not a CPU percentage. Interpretation depends on CPU capacity; a load near `4` means something different on a 2-CPU system and a 16-CPU system. It can include runnable work and, depending on the OS, tasks waiting for resources.

Portable monitoring must not interpret Windows zeros as proof that a machine is idle.

---

## 15. `os.endianness()`

Returns the byte order of the CPU for which Node.js was compiled:

```js
console.log(os.endianness()); // "LE" or "BE"
```

- `LE`: little endian;
- `BE`: big endian.

Endianness matters when interpreting multi-byte binary values. Node.js Buffers provide explicit methods such as `readUInt32LE()` and `readUInt32BE()`. Network protocols commonly define a fixed byte order, so follow the format specification rather than automatically choosing the host order.

---

## 16. `os.networkInterfaces()`

Returns an object keyed by interface name. Each value is an array because one interface can have several IPv4 and IPv6 addresses.

```js
const interfaces = os.networkInterfaces();

for (const [name, addresses] of Object.entries(interfaces)) {
  for (const details of addresses ?? []) {
    console.log(name, details.address, details.family);
  }
}
```

Address objects contain:

| Property | Meaning |
| --- | --- |
| `address` | Assigned IPv4 or IPv6 address |
| `netmask` | Network mask |
| `family` | `IPv4` or `IPv6` |
| `mac` | Interface MAC address |
| `internal` | `true` for loopback/internal interfaces |
| `scopeid` | IPv6 scope ID when applicable |
| `cidr` | Address plus prefix length, or `null` for an invalid mask |

Find non-internal IPv4 addresses:

```js
function externalIPv4Addresses() {
  return Object.entries(os.networkInterfaces()).flatMap(
    ([interfaceName, addresses = []]) =>
      addresses
        .filter((item) => item.family === "IPv4" && !item.internal)
        .map((item) => ({ interfaceName, address: item.address }))
  );
}
```

Important cautions:

- A machine can have zero, one, or many matching addresses.
- VPN, container, virtual, and disconnected adapters may appear.
- A local address is not necessarily the public internet address.
- Addresses can change while the process runs.
- Interface names are platform-specific.
- MAC addresses and network layout are sensitive operational data.

Do not automatically bind a server to the first returned address. Use an explicit configured host such as `127.0.0.1`, `0.0.0.0`, or a specified interface according to deployment requirements.

---

## 17. Process scheduling priority

### `os.getPriority([pid])`

```js
const currentPriority = os.getPriority();
```

With no PID or PID `0`, it returns the current process priority.

### `os.setPriority([pid, ]priority)`

```js
os.setPriority(os.constants.priority.PRIORITY_BELOW_NORMAL);
```

Numeric priority ranges from `-20` (higher priority) to `19` (lower priority). This direction often surprises beginners.

Windows maps Unix-style values to six priority classes, so reading a value back can differ slightly. The official docs recommend using `os.constants.priority` values to reduce confusion. Setting high priority can require elevated privileges; on Windows, a highest-priority request without elevation is silently reduced to high.

Changing priority affects system scheduling and can harm responsiveness. Demonstrate `getPriority()` freely, but treat `setPriority()` as an advanced operation and restore any changed value.

---

## 18. `os.constants`

`os.constants` contains platform-specific constants grouped into categories:

- signals;
- POSIX and Windows error values;
- dynamic-library loading (`dlopen`) flags;
- priority values;
- libuv constants.

```js
console.log(os.constants.signals.SIGINT);
console.log(os.constants.priority.PRIORITY_NORMAL);
```

Not every constant exists on every operating system. Guard platform-specific use:

```js
const sigterm = os.constants.signals.SIGTERM;
if (sigterm !== undefined) {
  console.log("SIGTERM value:", sigterm);
}
```

The numeric values are implementation details. Use named constants rather than copying numbers.

---

## 19. Building a system information report

```js
const os = require("node:os");

function bytesToGiB(bytes) {
  return Number((bytes / 1024 ** 3).toFixed(2));
}

function getSystemReport() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();

  return {
    platform: os.platform(),
    type: os.type(),
    release: os.release(),
    version: os.version(),
    architecture: os.arch(),
    machine: os.machine(),
    hostname: os.hostname(),
    uptimeSeconds: os.uptime(),
    availableParallelism: os.availableParallelism(),
    logicalCpuCount: os.cpus().length,
    memory: {
      totalGiB: bytesToGiB(totalMemory),
      freeGiB: bytesToGiB(freeMemory),
      usedPercent: Number(
        (((totalMemory - freeMemory) / totalMemory) * 100).toFixed(1)
      ),
    },
    temporaryDirectory: os.tmpdir(),
  };
}

console.log(getSystemReport());
```

This report intentionally omits user details, MAC addresses, and full network topology. A public health endpoint should reveal only what operators require.

---

## 20. Security and privacy

OS information can assist diagnostics, but it can also reveal infrastructure details.

Potentially sensitive values include:

- hostname;
- username and home directory;
- network addresses and MAC addresses;
- kernel and OS versions;
- CPU model and capacity;
- temporary paths.

Security guidelines:

1. Do not expose a raw `os` dump publicly.
2. Redact or omit personal and network identifiers.
3. Protect diagnostic endpoints with authorization.
4. Avoid placing secrets in temp filenames or logged paths.
5. Remember that platform detection is not authorization.
6. Treat reported capacity as changeable runtime information.

---

## 21. Common mistakes

### Calling properties as functions

```js
os.EOL();     // wrong
os.devNull(); // wrong
```

Both are string properties.

### Assuming `win32` means 32-bit

Use `os.arch()` for the Node.js binary architecture.

### Using `cpus().length` for workers

Use `os.availableParallelism()`.

### Treating CPU times as percentages

They are cumulative millisecond counters. Utilization needs two samples.

### Treating `freemem()` as Node heap space

Use `process.memoryUsage()` for process memory and V8 APIs for heap limits.

### Treating load average as portable CPU percentage

It is Unix-specific; Windows returns zeros.

### Choosing the first network address

Ordering and availability are not stable, and the first address may be internal or virtual.

### Hard-coding exact test results

System-dependent tests should verify types, valid ranges, and relationships.

### Exposing full reports to clients

Publish only the minimum operational data necessary.

---

## 22. API summary

| API | Returns/purpose |
| --- | --- |
| `os.EOL` | Platform line ending |
| `os.availableParallelism()` | Estimated usable parallelism |
| `os.arch()` | Architecture of the Node.js binary |
| `os.constants` | Named OS-specific constants |
| `os.cpus()` | Logical CPU descriptions and counters |
| `os.devNull` | Null-device path |
| `os.endianness()` | `LE` or `BE` byte order |
| `os.freemem()` | Free system memory in bytes |
| `os.getPriority()` | Process scheduling priority |
| `os.homedir()` | Current user's home-directory path |
| `os.hostname()` | Operating-system hostname |
| `os.loadavg()` | 1-, 5-, and 15-minute load averages |
| `os.machine()` | Operating-system machine type |
| `os.networkInterfaces()` | Assigned network-interface addresses |
| `os.platform()` | Compiled OS platform identifier |
| `os.release()` | OS release identifier |
| `os.setPriority()` | Attempt to change scheduling priority |
| `os.tmpdir()` | Preferred temporary directory |
| `os.totalmem()` | Total system memory in bytes |
| `os.type()` | OS name |
| `os.uptime()` | System uptime in seconds |
| `os.userInfo()` | Effective user information |
| `os.version()` | Kernel-version string |

---

## 23. Guided live coding

Create `os-demo.js`:

```js
const os = require("node:os");

const total = os.totalmem();
const free = os.freemem();

const summary = {
  platform: os.platform(),
  type: os.type(),
  architecture: os.arch(),
  machine: os.machine(),
  hostname: os.hostname(),
  parallelism: os.availableParallelism(),
  logicalCpus: os.cpus().length,
  memoryGiB: {
    total: (total / 1024 ** 3).toFixed(2),
    free: (free / 1024 ** 3).toFixed(2),
  },
  systemUptimeMinutes: Math.floor(os.uptime() / 60),
  processUptimeMinutes: Math.floor(process.uptime() / 60),
  temporaryDirectory: os.tmpdir(),
};

console.table(summary);
```

Discussion prompts:

1. Which values depend on the Node.js binary?
2. Which describe the operating system?
3. Why might logical CPU count exceed usable parallelism?
4. Why does system uptime exceed process uptime?
5. Which fields should not appear on a public endpoint?

---

## 24. Suggested 90-minute lesson plan

| Time | Activity |
| --- | --- |
| 0–10 min | Define OS information and import `node:os` |
| 10–25 min | Platform, type, release, version, architecture, machine |
| 25–38 min | Home, user, temp, hostname, EOL, and null device |
| 38–53 min | Memory, byte conversion, and uptime |
| 53–67 min | CPUs, parallelism, load average, and endianness |
| 67–78 min | Network interfaces and priority |
| 78–85 min | Security, privacy, and portability |
| 85–90 min | Exit ticket |

---

## 25. Review questions

1. Why is `os.platform()` equal to `process.platform`?
2. Why does Windows return `win32` even on a 64-bit machine?
3. How do `type()`, `release()`, and `version()` differ?
4. How can `arch()` and `machine()` describe different layers?
5. Is `os.EOL` a method or property?
6. When should a standardized delimiter be used instead of `os.EOL`?
7. Why use `os.devNull` instead of `/dev/null`?
8. Why can `homedir()` differ from `userInfo().homedir`?
9. Why is temp storage not permanent storage?
10. What units do memory methods return?
11. How does system uptime differ from process uptime?
12. What do CPU `times` fields represent?
13. Why should worker count use `availableParallelism()`?
14. What does `loadavg()` return on Windows?
15. Why is load average not a CPU percentage?
16. When does endianness matter?
17. Why can one interface contain several addresses?
18. Why is a local interface address not necessarily a public IP?
19. What direction do Unix numeric priority values use?
20. Why should raw system information not be publicly exposed?

## Key takeaway

Use `node:os` for portable system awareness, not for assumptions about a machine. Prefer `availableParallelism()` for concurrency, convert byte and time units deliberately, handle platform differences, and expose only the minimum system information an application genuinely needs.
