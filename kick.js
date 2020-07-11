/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-var-requires */
const spawn = require("child_process").spawn;

const proc = spawn("yarn", [
  "--cwd",
  `./packages/presentation/${process.env["GUILD_UTILS_J_ROLE"]}`,
  "start",
]);
proc.stderr.pipe(process.stderr);
proc.stdout.pipe(process.stdout);
