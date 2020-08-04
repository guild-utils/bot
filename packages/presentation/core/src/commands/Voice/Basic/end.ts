/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CommandStore, KlasaMessage } from "klasa";
import { inject, autoInjectable } from "tsyringe";
import { text2speechTargetTextChannels } from "../../../guild_settings_keys";
import * as LANG_KEYS from "../../../lang_keys";
import Engine from "../../../text2speech/engine";
import { CommandEx } from "presentation_klasa-core-command-rewrite";
@autoInjectable()
export default class extends CommandEx {
  constructor(
    store: CommandStore,
    file: string[],
    directory: string,
    @inject("engine") private readonly engine: Engine
  ) {
    super(store, file, directory);
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
