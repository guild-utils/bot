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
    const vc = msg.member?.voice.channel;
    if (!vc) {
      return msg.sendLocale(LANG_KEYS.COMMAND_START_FAILED_WITH_USER_NOT_IN_VC);
    }
    if (!vc.joinable) {
      return msg.sendLocale(
        LANG_KEYS.COMMAND_START_FAILED_WITH_BOT_NOT_JOINABLE
      );
    }
    const conn = await vc.join();
    await this.engine.register(conn);
    await msg.guildSettings.update(
      text2speechTargetTextChannels.join("."),
      msg.channel.id,
      { action: "add" }
    );
    return msg.sendLocale(LANG_KEYS.COMMAND_START_SUCCESS);
  }
}
