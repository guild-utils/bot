const spawn = require('child_process').spawn;

var proc = spawn("yarn",["--cwd", "./packages/presentation/klasa","start"]);
proc.stderr.pipe(process.stderr);
proc.stdout.pipe(process.stdout);