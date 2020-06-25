/* eslint-disable @typescript-eslint/no-var-requires */
const spawn = require("child_process").spawn;

const proc = spawn("yarn", ["--cwd", "./packages/presentation/klasa", "start"]);
proc.stderr.pipe(process.stderr);
proc.stdout.pipe(process.stdout);
