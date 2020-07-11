/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Command, CommandStore, KlasaMessage } from "klasa";
import { inject, autoInjectable } from "tsyringe";
import { text2speechTargetTextChannels } from "../../../guild_settings_keys";
import * as LANG_KEYS from "../../../lang_keys";
import Engine from "../../../text2speech/engine";
@autoInjectable()
export default class extends Command {
  constructor(
    store: CommandStore,
    file: string[],
    directory: string,
    @inject("engine") private readonly engine: Engine
  ) {
    super(store, file, directory, {
      usage: "",
      runIn: ["text"],
      aliases: ["e"],
      description: (lang) => lang.get(LANG_KEYS.COMMAND_END_DESCRIPTION),
    });
  }
  public async run(
    msg: KlasaMessage
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    await this.engine.unregister(msg.guild!.voice?.connection);
    msg.guild!.voice?.connection?.disconnect();
    await msg.guildSettings.reset(text2speechTargetTextChannels.join("."));

    return msg.sendLocale(LANG_KEYS.COMMAND_END_SUCCESS);
  }
}
