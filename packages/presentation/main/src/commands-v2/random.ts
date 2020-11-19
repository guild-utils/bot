import { CommandBase } from "@guild-utils/command-base";
import { Message, MessageEmbed } from "discord.js";
import { LayeredVoiceConfigRepository } from "domain_voice-configs-write";
import { getLangType } from "presentation_core";
import { Executor, executorFromMessage } from "protocol_util-djs";
import { XorShift } from "xorshift";
import { Usecase as VoiceConfigUsecase } from "domain_voice-configs";

export type CommandRandomResponseSuccessCtx = {
  newRandomizerValue: string | undefined;
  oldRandomizerValue: string | undefined;
};
export type CommandRandomResponses = {
  success: (
    exec: Executor,
    ctx: CommandRandomResponseSuccessCtx
  ) => MessageEmbed;
};
export class RandomCommand implements CommandBase {
  static create(
    repo: LayeredVoiceConfigRepository<[string, string]>,
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
    private readonly repo: LayeredVoiceConfigRepository<[string, string]>,
    private readonly usecase: VoiceConfigUsecase,
    private readonly responses: (lang: string) => CommandRandomResponses,
    private readonly getLang: getLangType
  ) {}

  async run(
    message: Message,
    positional: never,
    { overwrite }: Record<"overwrite", "member" | "none" | "user" | undefined>
  ): Promise<void> {
    const [h, l] = this.random.randomint();
    const v = (BigInt(h) << 32n) | BigInt(l);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const member = message.member!;
    const map: Record<"member" | "none" | "user", string | undefined> = {
      member: "m",
      user: "u",
      none: undefined,
    };
    const flags = overwrite == null ? undefined : map[overwrite] ?? undefined;
    const flagsWithDot = flags == null ? "" : `.${flags}`;
    const nv = `v3.${v}${flagsWithDot}`;
    const result = await this.repo.setRandomizer(
      [member.guild.id, member.id],
      nv
    );
    if (!(result.type === "ok" || result.type === "same")) {
      throw new TypeError("setRandomizer Failed");
    }
    const embed = this.responses(await this.getLang(message.guild?.id)).success(
      executorFromMessage(message),
      {
        newRandomizerValue: result.after as string | undefined,
        oldRandomizerValue: result.before as string | undefined,
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
