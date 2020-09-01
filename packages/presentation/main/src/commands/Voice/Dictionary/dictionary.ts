import { CommandStore, KlasaMessage } from "klasa";
import { CommandEx } from "presentation_klasa-core-command-rewrite";
import { DictionaryRepository } from "domain_voice-configs";
import { autoInjectable, inject } from "tsyringe";
import * as LANG_KEYS from "../../../lang_keys";
import { DictionaryJson } from "../../../text2speech";
import { MessageAttachment } from "discord.js";
import request = require("superagent");
import { Stream } from "stream";
type DeepUnknown<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? T[K] extends unknown[]
      ? unknown
      : DeepUnknown<T[K]>
    : unknown;
};
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, unknown>
    ? T[K] extends unknown[]
      ? DeepPartial<T[K]> | undefined
      : DeepUnknown<T[K]>
    : DeepPartial<T[K]>;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isReadable(params: any): params is Stream {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return params && !!params.readable;
}
function streamToString(stream: Stream): Promise<string> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}
@autoInjectable()
export default class extends CommandEx {
  constructor(
    store: CommandStore,
    file: string[],
    directory: string,
    @inject("DictionaryRepository")
    private readonly dictionary: DictionaryRepository
  ) {
    super(store, file, directory, {
      subcommands: true,
    });
  }
  async run(
    msg: KlasaMessage,
    [sub]: ["export" | "import" | "clear"]
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    return await this[sub](msg);
  }
  async export(
    msg: KlasaMessage
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const all = await this.dictionary.getAll(msg.guild!.id);
    const main: DictionaryJson["main"] = {};
    [...all.main.entries()].forEach(([k, v]) => {
      main[k] = v;
    });
    const obj: DictionaryJson = Object.assign({}, all, { main, version: "1" });
    const json = JSON.stringify(obj, null, 2);
    const attachment = new MessageAttachment(
      Buffer.from(json, "utf-8"),
      "dictionary.json"
    );
    return msg.send(
      msg.language.get(LANG_KEYS.COMMAND_EXPORT_SUCCESS),
      attachment
    );
  }
  async import(
    msg: KlasaMessage
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    try {
      msg.channel.startTyping().catch(console.log);
      const file = [...msg.attachments][0][1].attachment;

      const jsonStr = isReadable(file)
        ? await streamToString(file)
        : typeof file === "string"
        ? (await request.get(file)).text
        : file.toString("utf8");
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const gid = msg.guild!.id;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const obj: DeepPartial<DictionaryJson> = JSON.parse(jsonStr);
      const before = Promise.all(
        (obj.before ?? []).flatMap((entry) => {
          if (
            typeof entry?.from !== "string" ||
            typeof entry?.to !== "string"
          ) {
            return [];
          }
          return [
            this.dictionary.appendBefore(gid, {
              from: entry.from,
              to: entry.to,
            }),
          ];
        })
      );
      const main = Promise.all(
        Object.entries(obj.main ?? {}).flatMap(([k, entry]) => {
          const { to, p, p1, p2, p3 } = entry;
          if (
            typeof to !== "string" ||
            (p !== undefined && typeof p !== "string") ||
            (p1 !== undefined && typeof p1 !== "string") ||
            (p2 !== undefined && typeof p2 !== "string") ||
            (p3 !== undefined && typeof p3 !== "string")
          ) {
            return [];
          }
          return [this.dictionary.updateMain(gid, k, { to, p, p1, p2, p3 })];
        })
      );
      const after = Promise.all(
        (obj.after ?? []).flatMap((entry) => {
          if (
            typeof entry?.from !== "string" ||
            typeof entry?.to !== "string"
          ) {
            return [];
          }
          return [
            this.dictionary.appendAfter(gid, {
              from: entry.from,
              to: entry.to,
            }),
          ];
        })
      );
      await Promise.all([before, main, after]);
      msg.channel.stopTyping();
      return msg.sendLocale(LANG_KEYS.COMMAND_IMPORT_COMPLETE);
    } catch (e) {
      msg.channel.stopTyping();
      console.log(e);
      throw e;
    }
  }
  async clear(
    msg: KlasaMessage
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await this.dictionary.removeAll(msg.guild!.id);
    return msg.sendLocale(LANG_KEYS.COMMAND_CLEAR_SUCCESS);
  }
}
