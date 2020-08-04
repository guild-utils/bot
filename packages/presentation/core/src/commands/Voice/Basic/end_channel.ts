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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await this.engine.unregister(msg.guild!.voice?.connection);
    const arr: string[] = msg.guildSettings.get(
      text2speechTargetTextChannels.join(".")
    );
    const n = arr.filter((e) => e !== msg.channel.id);
    if (n.length === 0) {
      await msg.guildSettings.reset(text2speechTargetTextChannels.join("."));
    } else {
      await msg.guildSettings.update(
        text2speechTargetTextChannels.join("."),
        n,
        {
          action: "overwrite",
        }
      );
    }
    return msg.sendLocale(LANG_KEYS.COMMAND_END_SUCCESS);
  }
}
