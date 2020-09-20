import { CommandStore, KlasaMessage } from "klasa";
import { inject, autoInjectable } from "tsyringe";
import * as LANG_KEYS from "../../../lang_keys";
import Engine from "../../../text2speech/engine";
import { CommandEx } from "presentation_klasa-core-command-rewrite";
import { TextToSpeechTargetChannelDataStore } from "domain_guild-tts-target-channels";

@autoInjectable()
export default class extends CommandEx {
  constructor(
    store: CommandStore,
    file: string[],
    directory: string,
    @inject("engine") private readonly engine: Engine,
    @inject("TextToSpeechTargetChannelDataStore")
    private readonly dataStore: TextToSpeechTargetChannelDataStore
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
    await this.dataStore.addTextToSpeechTargetChannel(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      msg.guild!.id,
      msg.channel.id
    );
    return msg.sendLocale(LANG_KEYS.COMMAND_START_SUCCESS);
  }
}
