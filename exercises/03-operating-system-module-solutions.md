# Instructor Guide and Solutions: Node.js `os`

> Based on the [official Node.js OS documentation](https://nodejs.org/docs/latest/api/os.html), reviewed on 10 August 2026. Machine-specific output will vary. Keep this guide separate during assessed exercises.

Unless shown otherwise:

```js
const assert = require("node:assert/strict");
const os = require("node:os");
```

## Part A solutions

### Exercise 1

```js
const systemCard = {
  platform: os.platform(),
  type: os.type(),
  release: os.release(),
  version: os.version(),
  architecture: os.arch(),
  machine: os.machine(),
  hostname: os.hostname(),
};

console.log(systemCard);
```

`platform` is Node's compiled platform identifier; `type` is the OS name; `release` is its release identifier; `version` describes the kernel; `architecture` describes the Node.js binary; `machine` describes the OS machine type; `hostname` names the host.

### Exercise 2

```js
function friendlyPlatformName(platform) {
  const names = { win32: "Windows", darwin: "macOS", linux: "Linux" };
  return names[platform] ?? `Other (${platform})`;
}

assert.equal(friendlyPlatformName("win32"), "Windows");
assert.equal(friendlyPlatformName("darwin"), "macOS");
assert.equal(friendlyPlatformName("linux"), "Linux");
assert.equal(friendlyPlatformName("aix"), "Other (aix)");
```

### Exercise 3

```js
console.log({ arch: os.arch(), processArch: process.arch, machine: os.machine() });
assert.equal(os.arch(), process.arch);
```

`arch()` and `process.arch` describe the compiled Node.js binary. `machine()` describes the operating-system machine. A 32-bit Node binary can run on a 64-bit OS.

### Exercise 4

```js
const supported = new Set([
  "aix", "darwin", "freebsd", "linux", "openbsd", "sunos", "win32", "android",
]);

assert.equal(typeof os.platform(), "string");
assert.ok(supported.has(os.platform()));

for (const value of [os.type(), os.release(), os.version(), os.arch()]) {
  assert.equal(typeof value, "string");
  assert.ok(value.length > 0);
}
```

## Part B solutions

### Exercise 5

```js
console.log(JSON.stringify(os.EOL));
console.log(JSON.stringify("\n"));
console.log(JSON.stringify("\r\n"));

console.log(["first", "second", "third"].join(os.EOL));
console.log("first\r\nsecond\nthird".split(/\r?\n/));
```

`JSON.stringify()` makes invisible control characters visible as escapes.

### Exercise 6

```js
const fsSync = require("node:fs");
const { once } = require("node:events");

const output = fsSync.createWriteStream(os.devNull);
output.end("discard this");
await once(output, "finish");
```

The null device discards written bytes.

### Exercise 7

```js
const path = require("node:path");
const fs = require("node:fs/promises");

const directory = await fs.mkdtemp(path.join(os.tmpdir(), "os-class-"));
try {
  const filePath = path.join(directory, "message.txt");
  await fs.writeFile(filePath, "temporary", "utf8");
  console.log(await fs.readFile(filePath, "utf8"));
} finally {
  await fs.rm(directory, { recursive: true, force: true });
}
```

Temporary storage may be shared, quota-limited, or cleaned externally.

### Exercise 8

```js
console.log(os.homedir() === os.userInfo().homedir);
```

`homedir()` checks environment variables first; `userInfo()` obtains the OS-provided value.

## Part C solutions

### Exercise 9

```js
function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) {
    throw new TypeError("bytes must be a finite non-negative number");
  }
  if (bytes === 0) return "0 B";

  const units = ["B", "KiB", "MiB", "GiB", "TiB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  return `${(bytes / 1024 ** index).toFixed(2)} ${units[index]}`;
}
```

### Exercise 10

```js
function getMemoryReport() {
  const totalBytes = os.totalmem();
  const freeBytes = os.freemem();
  const usedBytes = Math.max(0, totalBytes - freeBytes);

  const percentage = (value) =>
    totalBytes === 0 ? 0 : Number(((value / totalBytes) * 100).toFixed(1));

  return {
    totalBytes,
    freeBytes,
    usedBytes,
    freePercent: percentage(freeBytes),
    usedPercent: percentage(usedBytes),
  };
}
```

This reports system memory. `process.memoryUsage()` reports the Node.js process.

### Exercise 11

```js
console.log({
  system: { total: os.totalmem(), free: os.freemem() },
  process: process.memoryUsage(),
});
```

Both use bytes. Process fields include RSS, heap totals/usage, external memory, and array buffers.

### Exercise 12

```js
function formatDuration(value) {
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError("seconds must be non-negative");
  }
  const total = Math.floor(value);
  const days = Math.floor(total / 86_400);
  const hours = Math.floor((total % 86_400) / 3_600);
  const minutes = Math.floor((total % 3_600) / 60);
  const seconds = total % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
```

### Exercise 13

```js
console.log("System:", formatDuration(os.uptime()));
console.log("Process:", formatDuration(process.uptime()));
```

The system usually started before this process. A recently created VM or container-visible environment can have a small system uptime.

## Part D solutions

### Exercise 14

```js
function getCpuSummary() {
  const cpus = os.cpus();
  return {
    logicalCpuCount: cpus.length,
    models: [...new Set(cpus.map((cpu) => cpu.model))],
    averageReportedMHz:
      cpus.length === 0
        ? 0
        : Number((cpus.reduce((sum, cpu) => sum + cpu.speed, 0) / cpus.length).toFixed(1)),
    totalIdleMilliseconds: cpus.reduce((sum, cpu) => sum + cpu.times.idle, 0),
  };
}
```

### Exercise 15

```js
function chooseWorkerCount({ reserve = 1, maximum = Infinity } = {}) {
  if (!Number.isFinite(reserve) || reserve < 0) {
    throw new TypeError("reserve must be a non-negative finite number");
  }
  if (maximum !== Infinity && (!Number.isFinite(maximum) || maximum < 1)) {
    throw new TypeError("maximum must be at least 1");
  }

  const available = os.availableParallelism();
  return Math.max(1, Math.min(Math.floor(maximum), available - Math.floor(reserve)));
}
```

`availableParallelism()` accounts better for affinity and runtime constraints than logical CPU count.

### Exercise 16

```js
function snapshotCpuTimes() {
  return os.cpus().map((cpu) => ({ ...cpu.times }));
}

function calculateCpuUsage(before, after) {
  return before.map((start, index) => {
    const end = after[index];
    if (!end) return null;

    const keys = ["user", "nice", "sys", "idle", "irq"];
    const deltas = Object.fromEntries(
      keys.map((key) => [key, end[key] - start[key]])
    );
    const total = Object.values(deltas).reduce((sum, value) => sum + value, 0);
    return total === 0 ? 0 : Number((((total - deltas.idle) / total) * 100).toFixed(1));
  });
}

const before = snapshotCpuTimes();
await new Promise((resolve) => setTimeout(resolve, 1_000));
console.log(calculateCpuUsage(before, snapshotCpuTimes()));
```

Scheduling, sampling duration, other work, and counter resolution affect the estimate.

### Exercise 17

```js
const loads = os.loadavg();
const parallelism = os.availableParallelism();
console.log({ loads, normalized: loads.map((value) => value / parallelism) });
```

Windows returns `[0, 0, 0]`. Load measures queued/active work over time, not a direct CPU percentage.

### Exercise 18

```js
console.log(os.endianness());

const little = Buffer.alloc(4);
little.writeUInt32LE(0x12345678);

const big = Buffer.alloc(4);
big.writeUInt32BE(0x12345678);

console.log([...little]); // 120, 86, 52, 18
console.log([...big]);    // 18, 52, 86, 120
```

## Part E solutions

### Exercise 19

```js
function getExternalIPv4Addresses() {
  return Object.entries(os.networkInterfaces()).flatMap(
    ([interfaceName, addresses = []]) =>
      addresses
        .filter((item) => item.family === "IPv4" && !item.internal)
        .map((item) => ({
          interfaceName,
          address: item.address,
          cidr: item.cidr,
          mac: item.mac,
        }))
  );
}
```

### Exercise 20

```js
function getSafeNetworkSummary() {
  const interfaces = os.networkInterfaces();
  const addresses = Object.values(interfaces).flatMap((items) => items ?? []);
  return {
    interfaceCount: Object.keys(interfaces).length,
    ipv4Count: addresses.filter((item) => item.family === "IPv4").length,
    ipv6Count: addresses.filter((item) => item.family === "IPv6").length,
    internalCount: addresses.filter((item) => item.internal).length,
    externalCount: addresses.filter((item) => !item.internal).length,
  };
}
```

### Exercise 21

```js
function getRedactedUserInfo() {
  const user = os.userInfo();
  return {
    hasUsername: Boolean(user.username),
    hasHomeDirectory: Boolean(user.homedir),
    hasShell: Boolean(user.shell),
    uidAvailable: user.uid !== -1,
    gidAvailable: user.gid !== -1,
  };
}
```

### Exercise 22

Hostnames can be duplicated, user-configurable, regenerated in containers, changed during provisioning, and not globally scoped. Generate and persist an application instance UUID or use an orchestrator-provided stable instance identity.

## Part F solutions

### Exercise 23

```js
console.log("Current:", os.getPriority());
console.table(os.constants.priority);
```

Lower Unix numeric values mean higher scheduling priority; `-20` is highest, not lowest importance.

### Exercise 24

```js
function countProperties(value) {
  return value && typeof value === "object" ? Object.keys(value).length : 0;
}

console.log({
  signals: countProperties(os.constants.signals),
  errors: countProperties(os.constants.errno),
  priority: countProperties(os.constants.priority),
  dlopen: countProperties(os.constants.dlopen),
});
```

Names communicate meaning and use the values appropriate to the current platform.

### Exercise 25

```js
const path = require("node:path");
const fs = require("node:fs/promises");

function getDiagnosticReport() {
  const total = os.totalmem();
  const free = os.freemem();
  const addresses = Object.values(os.networkInterfaces()).flatMap((x) => x ?? []);

  return {
    warning: "Review and redact before exposing this diagnostic report.",
    platform: os.platform(),
    type: os.type(),
    release: os.release(),
    architecture: os.arch(),
    machine: os.machine(),
    memoryGiB: {
      total: Number((total / 1024 ** 3).toFixed(2)),
      free: Number((free / 1024 ** 3).toFixed(2)),
      used: Number(((total - free) / 1024 ** 3).toFixed(2)),
    },
    uptimeSeconds: os.uptime(),
    availableParallelism: os.availableParallelism(),
    logicalCpuCount: os.cpus().length,
    loadAverage: os.platform() === "win32" ? null : os.loadavg(),
    temporaryDirectoryName: path.basename(os.tmpdir()),
    networkCounts: {
      total: addresses.length,
      internal: addresses.filter((item) => item.internal).length,
      external: addresses.filter((item) => !item.internal).length,
    },
  };
}

await fs.writeFile(
  "diagnostic-report.json",
  `${JSON.stringify(getDiagnosticReport(), null, 2)}\n`,
  "utf8"
);
```

## Pair-project reference design

Dependency injection makes platform edge cases testable:

```js
function createSystemHealth(osApi) {
  function getMemorySnapshot() {
    const total = osApi.totalmem();
    const free = osApi.freemem();
    const used = Math.max(0, total - free);
    return {
      total,
      free,
      used,
      usedPercent: total === 0 ? 0 : Number(((used / total) * 100).toFixed(1)),
    };
  }

  function getCpuSnapshot() {
    const cpus = osApi.cpus();
    return {
      logicalCount: cpus.length,
      availableParallelism: osApi.availableParallelism(),
      models: [...new Set(cpus.map((cpu) => cpu.model))],
      loadAverage: osApi.platform() === "win32" ? null : osApi.loadavg(),
    };
  }

  function getNetworkCounts() {
    const groups = osApi.networkInterfaces();
    const entries = Object.values(groups).flatMap((items) => items ?? []);
    return {
      interfaces: Object.keys(groups).length,
      ipv4: entries.filter((item) => item.family === "IPv4").length,
      ipv6: entries.filter((item) => item.family === "IPv6").length,
      internal: entries.filter((item) => item.internal).length,
      external: entries.filter((item) => !item.internal).length,
    };
  }

  function getSystemHealth() {
    return {
      platform: osApi.platform(),
      architecture: osApi.arch(),
      uptimeSeconds: osApi.uptime(),
      memory: getMemorySnapshot(),
      cpu: getCpuSnapshot(),
      network: getNetworkCounts(),
    };
  }

  return { getMemorySnapshot, getCpuSnapshot, getNetworkCounts, getSystemHealth };
}
```

Tests should pass fake OS objects rather than mocking global state. Include zero total memory, empty CPU arrays, Windows load behavior, multiple addresses, and normal Linux data.

## Exit-ticket answers

1. `win32`
2. `os.availableParallelism()`
3. Bytes
4. System uptime versus the current Node.js process uptime
5. `[0, 0, 0]`
6. Property
7. `os.devNull`
8. `homedir()` checks environment variables before its OS fallback
9. No
10. Any two of username, hostname, home path, address, MAC, kernel version, or CPU model
