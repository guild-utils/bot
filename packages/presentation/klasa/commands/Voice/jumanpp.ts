import { Command, CommandStore, KlasaMessage } from "klasa";
import * as LANG_KEYS from "../../lang_keys";
import { execFile } from "child_process";
import { encodeStream } from "iconv-lite";
function toFullWidth(elm: string) {
  return elm.replace(/[A-Za-z0-9!-~]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) + 0xfee0);
  });
}
export default class extends Command {
  constructor(store: CommandStore, file: string[], directory: string) {
    super(store, file, directory, {
      usage: "<text:string>",
      runIn: ["dm", "text"],
      description: (lang) => lang.get(LANG_KEYS.COMMAND_KUROMOJI_DESCRIPTION),
    });
  }
  public async run(
    msg: KlasaMessage,
    [text]: [string]
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    return msg.send(await this.spawn(text));
  }
  async spawn(text: string): Promise<string> {
    return await new Promise((resolve) => {
      console.log(process.env["JUMANPP_PATH"]);
      const cp = execFile(
        process.env["JUMANPP_PATH"]!,
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
