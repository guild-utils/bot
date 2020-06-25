import { Command, CommandStore, KlasaMessage } from "klasa";
import { TextChannel, Message } from "discord.js";
import { parse } from "url";

export default class extends Command {
  constructor(store: CommandStore, file: string[], directory: string) {
    super(store, file, directory, {
      usage: "<targetMsg:msg|targetMsgURL:url|targetMsgIdWithChannel:string>",
      runIn: ["text"],
    });
  }
  async run(
    message: KlasaMessage,
    [raw]: [string | KlasaMessage]
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    let target: Message;
    if (typeof raw === "string") {
      const url = parse(raw);
      if (!url.host) {
        const sp = raw.split("/");
        const tmc = message.guild!.channels.resolve(sp[0]);
        if (!tmc || tmc.type !== "text") {
          return message.sendMessage("不正な引数");
        }
        const tmct: TextChannel = tmc as TextChannel;
        await tmct.messages.fetch();
        const msg = tmct.messages.resolve(sp[1]);
        if (!msg) {
          return message.sendMessage("不正な引数");
        }
        target = msg;
      } else {
        if (!url.path) {
          return message.sendMessage("不正な引数");
        }
        const sp = url.path.split("/");
        const cid = sp[3];
        const mid = sp[4];
        const tmc = message.guild!.channels.resolve(cid);
        if (!tmc || tmc.type !== "text") {
          return message.sendMessage("不正な引数");
        }
        const tmct: TextChannel = tmc as TextChannel;
        await tmct.messages.fetch();
        const msg = tmct.messages.resolve(mid);
        if (!msg) {
          return message.sendMessage("不正な引数");
        }
        target = msg;
      }
    } else {
      target = raw;
    }

    return Promise.all(
      target.reactions.cache.array().map(async (e) => {
        await e.users.fetch();
        return await message.sendMessage(
          `
${e.emoji}\n
${e.users.cache
  .array()
  .map((e) => message.guild!.members.resolve(e)!.displayName)
  .join("\n")}
`
        );
      })
    );
  }
}
