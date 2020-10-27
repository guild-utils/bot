import { DictionaryRepository } from "domain_voice-configs";
import { DictionaryJson } from "../text2speech";
import {
  Message,
  MessageAttachment,
  MessageEmbed,
  Permissions,
} from "discord.js";
import request = require("superagent");
import { Stream } from "stream";
import { CommandBase, CommandContext } from "@guild-utils/command-base";
import {
  getLangType,
  SenderPermissionError,
  subCommandProcessor,
  SubCommandProcessor,
} from "presentation_core";
import { Executor, executorFromMessage } from "protocol_util-djs";
import { MANAGEMENT } from "protocol_command-schema-core";
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
export type DictionaryCommandResponses = {
  exportSuccess(exec: Executor): MessageEmbed;
  importSuccess(exec: Executor): MessageEmbed;
  clearSuccess(exec: Executor): MessageEmbed;
  requireSubCommand(exec: Executor): MessageEmbed;
};
export class DictionaryCommand implements CommandBase {
  private readonly processor: SubCommandProcessor<DictionaryCommand>;
  constructor(
    private readonly dictionary: DictionaryRepository,
    private readonly responses: (lang: string) => DictionaryCommandResponses,
    private readonly getLang: getLangType
  ) {
    this.processor = subCommandProcessor(
      this,
      async (msg) => {
        await msg.channel.send(
          this.responses(await this.getLang(msg.guild?.id)).requireSubCommand(
            executorFromMessage(msg)
          )
        );
      },
      () => new Set([MANAGEMENT])
    );
  }
  async run(
    msg: Message,
    pos: never,
    opt: never,
    ctx: CommandContext
  ): Promise<void> {
    const sub = ctx.runningCommand[1] as
      | "export"
      | "import"
      | "clear"
      | undefined;
    await this.processor(
      sub,
      new Map([
        [
          MANAGEMENT,
          (msg: Message) => {
            if (!msg.member?.hasPermission("MANAGE_GUILD")) {
              const perms = new Permissions(["MANAGE_GUILD"]);
              return Promise.reject(
                new SenderPermissionError(
                  perms,
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  msg.member!.permissions,
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  msg.guild!
                )
              );
            }
            return Promise.resolve();
          },
        ],
      ])
    )(msg, pos, opt, ctx);
  }
  async export(msg: Message): Promise<void> {
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
    await msg.channel.send(
      this.responses(await this.getLang(msg.guild?.id)),
      attachment
    );
  }
  async import(msg: Message): Promise<void> {
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
      await msg.channel.send(
        this.responses(await this.getLang(msg.guild?.id)).importSuccess(
          executorFromMessage(msg)
        )
      );
    } catch (e) {
      msg.channel.stopTyping();
      console.log(e);
      throw e;
    }
  }
  async clear(msg: Message): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await this.dictionary.removeAll(msg.guild!.id);
    await msg.channel.send(
      this.responses(await this.getLang(msg.guild?.id)).clearSuccess(
        executorFromMessage(msg)
      )
    );
  }
}
