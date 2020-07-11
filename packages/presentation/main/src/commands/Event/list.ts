import { Command, CommandStore, KlasaMessage } from "klasa";
import { inject, autoInjectable } from "tsyringe";
import { GameEvent } from "domain_game-event";
import { GameEventUseCase } from "usecase_game-event";
import { GOOGLE_API_CREDENTIAL } from "../../bootstrap/env";
import { googleSpreadSheetId } from "../../guild_settings_keys";
import * as LANG_KEYS from "../../lang_keys";
@autoInjectable()
export default class extends Command {
  private readonly gameEvent: GameEventUseCase;
  constructor(
    store: CommandStore,
    file: string[],
    directory: string,
    @inject("GameEventUseCase") gameEvent: GameEventUseCase
  ) {
    super(store, file, directory, {
      usage: "[collectionName:string]",
      runIn: ["text"],
      enabled: Boolean(GOOGLE_API_CREDENTIAL),
      requiredPermissions: ["SEND_MESSAGES"],
      description: (lang) => lang.get(LANG_KEYS.COMMAND_LIST_DESCRIPTION),
    });
    this.gameEvent = gameEvent;
  }
  public async run(
    msg: KlasaMessage,
    [collectionName]: [string?]
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    const gsid: string = msg.guildSettings.get(googleSpreadSheetId);
    if (collectionName) {
      const list = await this.gameEvent.collection(gsid, collectionName);
      const arr: GameEvent[] = list.events;
      const rep = [
        `**${list.name.name}** ${list.kind}`,
        list.header.join(" "),
        ...arr.map((e) => list.header.map((e2) => e.desc[e2]).join(" ")),
      ].join("\n");
      return msg.sendMessage(rep);
    }
    const rep = (await this.gameEvent.listCollectionName(gsid))
      .map((e) => `${e.name}:${e.kind}`)
      .join("\n");
    return msg.sendMessage(rep);
  }
}
