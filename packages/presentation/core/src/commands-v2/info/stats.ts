import {
  ColorResolvable,
  GuildMember,
  Message,
  MessageEmbed,
  User,
} from "discord.js";
import { CommandBase } from "@guild-utils/command-base";
import { getLangType } from "../../util/get-lang";
import { BUILD_DATE } from "../../bootstrap/env";

export class CommandStats implements CommandBase {
  constructor(
    private readonly statsEmbed: (
      lang: string
    ) => (
      a: {
        memory: number;
        uptimeInMs: number;
        guilds: number;
        channels: number;
        color: ColorResolvable;
        buildDate: string;
      },
      b: { user: User; member?: GuildMember | null }
    ) => MessageEmbed,
    private readonly color: ColorResolvable,
    private readonly getLang: getLangType
  ) {}
  async run(message: Message): Promise<void> {
    let [guilds, channels, memory] = [0, 0, 0];
    const client = message.client;
    if (client.shard) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const results: number[][] = await client.shard.broadcastEval(
        `[this.guilds.cache.size, this.channels.cache.size, (process.memoryUsage().rss / 1024 / 1024)]`
      );
      for (const result of results) {
        guilds += result[0];
        channels += result[1];
        memory += result[2];
      }
    }

    await message.channel.send(
      this.statsEmbed(await this.getLang(message.guild?.id))(
        {
          memory: Math.round(
            (memory || process.memoryUsage().rss) / 1024 / 1024
          ),
          uptimeInMs: Math.round(process.uptime() * 1000),
          channels: channels || client.channels.cache.size,
          guilds: guilds || client.guilds.cache.size,
          color: this.color,
          buildDate: BUILD_DATE,
        },
        {
          user: message.author,
          member: message.member,
        }
      )
    );
  }
}
