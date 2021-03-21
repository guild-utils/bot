import { CommandBase } from "@guild-utils/command-base";
import { GuildMember, Message, MessageEmbed } from "discord.js";
import { getLangType } from "presentation_core";
import { Executor, executorFromMessage } from "protocol_util-djs";
import { XorShift } from "xorshift";
import { Usecase as VoiceConfigUsecase } from "domain_voice-configs";
import { ConfigurateUsecase } from "protocol_configurate-usecase";

export type CommandRandomResponseSuccessCtx = {
  newRandomizerValue: string | undefined;
  oldRandomizerValue: string | undefined;
};
export type CommandRandomResponses = {
  success: (
    exec: Executor,
    target: GuildMember,
    ctx: CommandRandomResponseSuccessCtx
  ) => MessageEmbed;
};
export class RandomCommand implements CommandBase {
  static create(
    repo: ConfigurateUsecase,
    usecase: VoiceConfigUsecase,
    responses: (lang: string) => CommandRandomResponses,
    getLang: getLangType
  ): RandomCommand {
    const now = Date.now();
    const random = new XorShift([0, 0, now >>> 32, now | 0]);
    for (let i = 0; i < 50; ++i) {
      random.randomint();
    }
    return new RandomCommand(random, repo, usecase, responses, getLang);
  }
  private constructor(
    private readonly random: XorShift,
    private readonly repo: ConfigurateUsecase,
    private readonly usecase: VoiceConfigUsecase,
    private readonly responses: (lang: string) => CommandRandomResponses,
    private readonly getLang: getLangType
  ) {}

  async run(
    message: Message,
    [argMember]: [GuildMember?],
    { overwrite }: Record<"overwrite", "member" | "none" | "user" | undefined>
  ): Promise<void> {
    const [h, l] = this.random.randomint();
    const v = (BigInt(h) << 32n) | BigInt(l);
    const map: Record<"member" | "none" | "user", string | undefined> = {
      member: "m",
      user: "u",
      none: undefined,
    };
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const member = argMember ?? message.member!;
    const flags = overwrite == null ? undefined : map[overwrite] ?? undefined;
    const flagsWithDot = flags == null ? "" : `.${flags}`;
    const nv = `v3.${v}${flagsWithDot}`;
    const resultRaw = await this.repo.set(
      {
        member: [member.guild.id, member.id],
      },
      "randomizer",
      nv,
      {
        guild: message.guild?.id,
        user: message.author.id,
      }
    );
    if (Array.isArray(resultRaw) && resultRaw.length !== 1) {
      throw new Error("Invalid result");
    }
    const result = Array.isArray(resultRaw) ? resultRaw[0] : resultRaw;
    if (!(result.type === "ok" || result.type === "same")) {
      throw new TypeError("setRandomizer Failed");
    }
    const embed = this.responses(await this.getLang(message.guild?.id)).success(
      executorFromMessage(message),
      member,
      {
        newRandomizerValue: result.vafter,
        oldRandomizerValue: result.vbefore,
      }
    );
    const ret = await this.usecase.appliedVoiceConfigResolvedBy(
      member.guild.id,
      member.user.id,
      member.nickname ?? undefined,
      member.user.username
    );
    function addField<K extends keyof typeof ret>(k: K) {
      embed.addField(`${k}(${ret[k].provider})`, ret[k].value ?? "-", true);
    }
    addField("allpass");
    addField("intone");
    addField("kind");
    addField("maxReadLimit");
    addField("speed");
    addField("threshold");
    addField("tone");
    addField("volume");
    await message.channel.send(embed);
  }
}
