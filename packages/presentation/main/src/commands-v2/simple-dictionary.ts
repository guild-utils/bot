import { DictionaryEntryB, DictionaryRepository } from "domain_voice-configs";
import { CommandBase, CommandContext } from "@guild-utils/command-base";
import { EmbedFieldData, Message, MessageEmbed } from "discord.js";
import { Executor, executorFromMessage } from "protocol_util-djs";
import { getLangType } from "presentation_core";
import { createView, CreateViewResponses, viewStart } from "../gui/pagination";
import { ConnectableObservableRxEnv } from "../gui/pagination/action-pipeline";

export type PageValue = DictionaryEntryB & { index: number };
export type SimpleDictionaryCommandResponses = {
  invalidAddFormat: (exec: Executor) => MessageEmbed;
  addSuccess: (exec: Executor, cur: DictionaryEntryB) => MessageEmbed;
  invalidRemoveFormat: (exec: Executor) => MessageEmbed;
  invalidIndexRange: (exec: Executor) => MessageEmbed;
  invalidUpdateFormat: (exec: Executor) => MessageEmbed;
  updateSuccess: (
    exec: Executor,
    before: DictionaryEntryB,
    after: DictionaryEntryB
  ) => MessageEmbed;
  deleteSuccess: (exec: Executor, deleted: DictionaryEntryB) => MessageEmbed;
} & CreateViewResponses;
export type SimpleDictionaryActions = {
  append: (
    guild: string,
    entry: DictionaryEntryB,
    pos?: number
  ) => Promise<DictionaryEntryB>;
  remove: (guild: string, key: number) => Promise<DictionaryEntryB | undefined>;
  update: (
    guild: string,
    key: number,
    entry: DictionaryEntryB | string
  ) => Promise<[DictionaryEntryB, DictionaryEntryB] | undefined>;
  get: (guild: string) => Promise<DictionaryEntryB[]>;
};
function createFields(e: PageValue): EmbedFieldData {
  return {
    name: `[${e.index + 1}] ${e.from}`,
    value: `\`\`\`\n${e.to}\n\`\`\``,
  };
}
export class SimpleDictionaryCommand implements CommandBase {
  constructor(
    private readonly actions: SimpleDictionaryActions,
    private readonly rxEnv: ConnectableObservableRxEnv,
    private readonly responses: (
      lang: string
    ) => SimpleDictionaryCommandResponses,
    private readonly getLang: getLangType
  ) {}
  async run(
    msg: Message,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args: any[],
    opt: never,
    ctx: CommandContext
  ): Promise<void> {
    const sub = ctx.runningCommand[1] as
      | "add"
      | "insert"
      | "remove"
      | "update"
      | "list"
      | undefined;
    if (sub == null) {
      return await this.list(msg);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this[sub](msg, args as any);
  }
  async insert(
    msg: Message,
    [arg1, arg2]: [number, DictionaryEntryB]
  ): Promise<void> {
    const res = this.responses(await this.getLang(msg.guild?.id));
    const exec = executorFromMessage(msg);
    if (arg1 === undefined) {
      await msg.channel.send(res.invalidAddFormat(exec));
      return;
    }
    if (typeof arg2 === "string") {
      await msg.channel.send(res.invalidAddFormat(exec));
      return;
    }

    const append = () => {
      if (typeof arg1 === "number") {
        if (!arg2) {
          return msg.channel.send(res.invalidAddFormat(exec));
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.actions.append(msg.guild!.id, arg2, arg1 - 1);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.actions.append(msg.guild!.id, arg1);
      }
    };
    const r = await append();
    if (r instanceof Message) {
      return;
    }
    await msg.channel.send(res.addSuccess(exec, r));
  }
  async add(msg: Message, [arg2]: [DictionaryEntryB]): Promise<void> {
    const res = this.responses(await this.getLang(msg.guild?.id));
    const exec = executorFromMessage(msg);
    if (typeof arg2 === "string") {
      await msg.channel.send(res.invalidAddFormat(exec));
      return;
    }

    const append = () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.actions.append(msg.guild!.id, arg2);
    };
    const r = await append();
    if (r instanceof Message) {
      return;
    }
    await msg.channel.send(res.addSuccess(exec, r));
  }
  async remove(msg: Message, [arg1]: [number]): Promise<void> {
    const res = this.responses(await this.getLang(msg.guild?.id));
    const exec = executorFromMessage(msg);
    if (arg1 === undefined) {
      await msg.channel.send(res.invalidRemoveFormat(exec));
      return;
    }
    if (typeof arg1 !== "number") {
      await msg.channel.send(res.invalidRemoveFormat(exec));
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const r = await this.actions.remove(msg.guild!.id, arg1 - 1);
    if (r) {
      await msg.channel.send(res.deleteSuccess(exec, r));
      return;
    } else {
      await msg.channel.send(res.invalidIndexRange(exec));
      return;
    }
  }
  async update(
    msg: Message,
    [arg1, arg2]: [number, string | DictionaryEntryB]
  ): Promise<void> {
    const res = this.responses(await this.getLang(msg.guild?.id));
    const exec = executorFromMessage(msg);
    if (arg1 === undefined) {
      await msg.channel.send(res.invalidUpdateFormat(exec));
      return;
    }
    if (typeof arg1 !== "number") {
      await msg.channel.send(res.invalidUpdateFormat(exec));
      return;
    }
    arg2 = arg2 ?? "";
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const r = await this.actions.update(msg.guild!.id, arg1 - 1, arg2);
    if (r === undefined) {
      await msg.channel.send(res.invalidIndexRange(exec));
      return;
    } else {
      await msg.channel.send(res.updateSuccess(exec, r[0], r[1]));
      return;
    }
  }
  async list(message: Message): Promise<void> {
    const split = (array: PageValue[], n: number) =>
      array.reduce(
        (a: PageValue[][], c: PageValue, i: number): PageValue[][] =>
          i % n == 0
            ? [...a, [c]]
            : [...a.slice(0, -1), [...a[a.length - 1], c]],
        [] as PageValue[][]
      );
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const p = await this.actions.get(message.guild!.id);
    const splited = split(
      p.map((e, i) => ({ ...e, index: i })),
      10
    );
    const responses = this.responses(await this.getLang(message.guild?.id));
    // eslint-disable-next-line @typescript-eslint/require-await
    const view = createView(
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

export function commandBeforeDictionary(
  repo: DictionaryRepository,
  rxEnv: ConnectableObservableRxEnv,
  responses: (lang: string) => SimpleDictionaryCommandResponses,
  getLang: getLangType
): SimpleDictionaryCommand {
  return new SimpleDictionaryCommand(
    {
      append: repo.appendBefore.bind(repo),
      get: repo.getBefore.bind(repo),
      remove: repo.removeBefore.bind(repo),
      update: repo.updateBefore.bind(repo),
    },
    rxEnv,
    responses,
    getLang
  );
}
export function commandAfterDictionary(
  repo: DictionaryRepository,
  rxEnv: ConnectableObservableRxEnv,
  responses: (lang: string) => SimpleDictionaryCommandResponses,
  getLang: getLangType
): SimpleDictionaryCommand {
  return new SimpleDictionaryCommand(
    {
      append: repo.appendAfter.bind(repo),
      get: repo.getAfter.bind(repo),
      remove: repo.removeAfter.bind(repo),
      update: repo.updateAfter.bind(repo),
    },
    rxEnv,
    responses,
    getLang
  );
}
