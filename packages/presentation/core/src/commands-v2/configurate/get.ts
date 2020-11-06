import { CommandBase } from "@guild-utils/command-base";
import { ColorResolvable, Message, MessageEmbed } from "discord.js";
import {
  ConfigurateUsecase,
  GetResponseType,
} from "protocol_configurate-usecase";
import {
  createEmbedWithMetaData,
  CreateEmbedWithMetaDataOpt,
  executorFromMessage,
} from "protocol_util-djs";
import { getLangType } from "../../util/get-lang";
import {
  buildTargetAndExecutor,
  ConfigCommandCommonOption,
  ErrorHandlerResponses,
  getEnviroment,
} from "./util";
function addEntryIfExists(
  embed: MessageEmbed,
  ek: keyof GetResponseType,
  res: GetResponseType
): void {
  const map = {
    guild: "server",
    user: "user",
    member: "member",
  };
  if (!(ek in res)) {
    return;
  }
  embed.addField(map[ek], res[ek] ?? "-");
}
export function buildResponseWithSingleKey(
  key: string,
  response: GetResponseType,
  opt: CreateEmbedWithMetaDataOpt
): MessageEmbed {
  const embed = createEmbedWithMetaData(opt);
  embed.setTitle(key);
  const eks: (keyof GetResponseType)[] = ["guild", "user", "member"];
  eks.forEach((ek: keyof GetResponseType) =>
    addEntryIfExists(embed, ek, response)
  );
  return embed;
}
export class CommandGet implements CommandBase {
  constructor(
    private readonly usecase: ConfigurateUsecase,
    private readonly color: ColorResolvable,
    private readonly responses: (lang: string) => ErrorHandlerResponses,
    private readonly getLang: getLangType
  ) {}
  async run(
    message: Message,
    [key]: [string],
    option: ConfigCommandCommonOption
  ): Promise<void> {
    const { target, executor } = buildTargetAndExecutor(message, option);
    await getEnviroment(
      async () => {
        const r = await this.usecase.get(target, key, executor);
        await message.channel.send(
          buildResponseWithSingleKey(key, r, {
            color: this.color,
            member: message.member,
            user: message.author,
            timestamp: Date.now(),
          })
        );
      },
      message.channel,
      this.responses(await this.getLang(message.guild?.id)),
      key,
      executorFromMessage(message)
    );
  }
}
