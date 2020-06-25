/* eslint-disable @typescript-eslint/no-var-requires */
const { spawn } = require("child_process");

var proc = spawn("PowerShell.exe", [
  "-windowstyle",
  "hidden",
  "-command",
  "yarn",
  "--cwd",
  "./packages/presentation/klasa",
  "start",
]);
proc.stderr.pipe(process.stderr);
proc.stdout.pipe(process.stdout);
