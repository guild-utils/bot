import { CommandBase } from "@guild-utils/command-base";
import { execFile } from "child_process";
import { Message } from "discord.js";
import { encodeStream } from "iconv-lite";
import * as ENV from "../bootstrap/env";
function toFullWidth(elm: string) {
  return elm.replace(/[A-Za-z0-9!-~]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) + 0xfee0);
  });
}
export class JumanppCommand implements CommandBase {
  public async run(msg: Message, [text]: [string]): Promise<void> {
    await msg.send("```" + (await this.spawn(text)) + "```");
  }
  async spawn(text: string): Promise<string> {
    return await new Promise((resolve) => {
      const cp = execFile(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ENV.JUMANPP_PATH!,
        [],
        (error, stdout, stderr) => {
          console.log(error);
          console.log(stdout);
          console.log(stderr);
          resolve(stdout);
        }
      );
      const charset = process.env["OPEN_JTALK_INPUT_CHARSET"];
      if (charset) {
        const conv = encodeStream(charset);
        conv.on("error", (...args) => {
          console.log(args);
        });
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        conv.pipe(cp.stdin!);
        conv.write(toFullWidth(text));
        conv.end();
      } else {
        cp.stdin?.write(toFullWidth(text));
      }
      cp.stdin?.end();
      cp.stdin?.on("error", (err) => {
        console.log(err);
      });
    });
  }
}
