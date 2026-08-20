const os = require("os");
const { parse } = require("path");

// console.log("os module: ", os);

// System information
console.log("OS arch: ", os.arch()); // returns the operating system CPU architecture
console.log("OS platform: ", os.platform()); // returns the operating system platform
console.log("OS type: ", os.type()); // returns the operating system name
console.log("OS release: ", os.release()); // returns the operating system release number.
console.log("OS version: ", os.version()); // returns a string identifying the kernel version. On Windows, this includes build information.

/// User and Environment
console.log("OS userInfo", os.userInfo()); // returns information about the currently effective user.
console.log("os homedir", os.homedir());
console.log("parse (from path)", parse(os.homedir()));
const hostname = os.hostname();
console.log(`Hostname: ${hostname}`);
// Get the system default temp dir
console.log(`Temporary Directory: ${os.tmpdir()}`);

/// System Resources
// Get CPU information
const cpus = os.cpus();
console.log(`CPU Cores: ${cpus}`);
cpus.forEach((cpu, index) => {
  console.log(`\nCPU Core ${index + 1}:`);
  console.log(`- Model: ${cpu.model}`);
  console.log(`- Speed: ${cpu.speed} MHz`);
  console.log("- Times (ms):", {
    user: cpu.times.user,
    nice: cpu.times.nice,
    sys: cpu.times.sys,
    idle: cpu.times.idle,
    irq: cpu.times.irq,
  });
});
// console.log(cpus[0]);
const totalMem = os.totalmem();
console.log(`Total memory: ${totalMem}`); // in bytes
const freeMem = os.freemem();
console.log(`Free memory: ${freeMem}`); // bytes
const usedMem = totalMem - freeMem;
console.log(`Used memory: ${usedMem}`); // bytes

// Network Information
console.log("Network Interfaces", os.networkInterfaces());
console.log("Uptime ", os.uptime()); // in seconds
const lines = ["First line", "Second line", "Third line"];

// Join lines with the correct EOL character
const content = lines.join(os.EOL);
console.log(content);
