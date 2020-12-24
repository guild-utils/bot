import { DictionaryRepository, DictionaryEntryA } from "domain_voice-configs";
import { CommandBase, CommandContext } from "@guild-utils/command-base";
import { Message, MessageEmbed } from "discord.js";
import { Executor, executorFromMessage } from "protocol_util-djs";
import { getLangType } from "presentation_core";
import { View } from "../gui/pagination/render";
import { ConnectableObservableRxEnv } from "../gui/pagination/action-pipeline";
import { createView, CreateViewResponses, viewStart } from "../gui/pagination";
type MainDictEntry = {
  to: string;
  p?: string;
  p1?: string;
  p2?: string;
  p3?: string;
};
export type PageValue = DictionaryEntryA & { from: string };
export type MainDictionaryCommandResponses = {
  requireKey: (exec: Executor) => MessageEmbed;
  invalidRemoveFormat: (exec: Executor) => MessageEmbed;
  deleteWordSuccesWithDelete: (
    exec: Executor,
    from: string,
    to: string
  ) => MessageEmbed;
  deleteWordSuccesWithNone: (exec: Executor, from: string) => MessageEmbed;
  addWordSuccessWithOverwrite: (
    exec: Executor,
    before: MainDictEntry & { from: string },
    current: MainDictEntry & { from: string }
  ) => MessageEmbed;
  addWordSuccessWithCreate: (
    exec: Executor,
    current: MainDictEntry & { from: string }
  ) => MessageEmbed;
} & CreateViewResponses;

function createFields(e: PageValue) {
  const additionalValue =
    e.p == null
      ? ""
      : "(" +
        (["p", "p1", "p2", "p3"] as const)
          .map((k) => e[k])
          .filter((e): e is string => e != null)
          .map((e) => `\`${e}\``)
          .join(",") +
        ")";
  return {
    name: `🔑 ${e.from}`,
    value: `\`\`\`\n${e.to}\n\`\`\`${additionalValue}`,
  };
}
export class MainDictionaryCommand implements CommandBase {
  constructor(
    private readonly dictionary: DictionaryRepository,
    private readonly rxEnv: ConnectableObservableRxEnv,
    private readonly responses: (
      lang: string
    ) => MainDictionaryCommandResponses,
    private readonly getLang: getLangType
  ) {}
  async run(
    msg: Message,
    args: [string, MainDictEntry?],
    opt: never,
    ctx: CommandContext
  ): Promise<void> {
    const sub = ctx.runningCommand[1] as
      | "add"
      | "remove"
      | "update"
      | "list"
      | undefined;
    if (sub == null) {
      return await this.list(msg);
    }
    return await this[sub](msg, args);
  }
  async add(msg: Message, args: [string?, MainDictEntry?]): Promise<void> {
    return this.update(msg, args);
  }
  async remove(
    msg: Message,
    [arg1, arg2]: [string?, MainDictEntry?]
  ): Promise<void> {
    const res = this.responses(await this.getLang(msg.guild?.id));
    const exec = executorFromMessage(msg);
    if (!arg1) {
      await msg.channel.send(res.requireKey(exec));
      return;
    }
    if (arg2) {
      await msg.channel.send(res.invalidRemoveFormat(exec));
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const r = await this.dictionary.removeMain(msg.guild!.id, arg1);
    if (r) {
      await msg.channel.send(res.deleteWordSuccesWithDelete(exec, arg1, r.to));
      return;
    } else {
      await msg.channel.send(res.deleteWordSuccesWithNone(exec, arg1));
      return;
    }
  }
  async update(
    msg: Message,
    [arg1, arg2]: [string?, MainDictEntry?]
  ): Promise<void> {
    const res = this.responses(await this.getLang(msg.guild?.id));
    const exec = executorFromMessage(msg);
    if (!arg1) {
      await msg.channel.send(res.requireKey(exec));
      return;
    }
    if (!arg2) {
      arg2 = { to: "" };
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const r = await this.dictionary.updateMain(msg.guild!.id, arg1, arg2);
    if (!r[0]) {
      await msg.channel.send(
        res.addWordSuccessWithCreate(exec, {
          from: arg1,
          ...r[1],
        })
      );
      return;
    } else {
      await msg.channel.send(
        res.addWordSuccessWithOverwrite(
          exec,
          { from: arg1, ...r[0] },
          { from: arg1, ...r[1] }
        )
      );
      return;
    }
  }
  async list(message: Message): Promise<void> {
    const split = (array: (DictionaryEntryA & { from: string })[], n: number) =>
      array.reduce(
        (
          a: (DictionaryEntryA & { from: string })[][],
          c: DictionaryEntryA & { from: string },
          i: number
        ): (DictionaryEntryA & { from: string })[][] =>
          i % n == 0
            ? [...a, [c]]
            : [...a.slice(0, -1), [...a[a.length - 1], c]],
        [] as (DictionaryEntryA & { from: string })[][]
      );
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const p = await this.dictionary.getMain(message.guild!.id);
    const u = [...p.entries()].map((e) => {
      return { from: e[0], ...e[1] };
    });
    const splited = split(u, 10);
    const responses = this.responses(await this.getLang(message.guild?.id));
    const view: View = createView(
      splited,
      responses,
      createFields,
      message.author,
      message.member
    );
    await viewStart(
      view,
      this.rxEnv,
      message.channel,
      message.author,
      splited.length
    );
  }
}
