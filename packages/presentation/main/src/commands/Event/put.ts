import { Command, CommandStore, KlasaMessage } from "klasa";
import { autoInjectable, inject } from "tsyringe";
import { GameEventUseCase } from "usecase_game-event";
import { GameEvent } from "domain_game-event";
import { googleSpreadSheetId } from "../../guild_settings_keys";
import * as LANG_KEYS from "../../lang_keys";
import { GOOGLE_API_CREDENTIAL } from "../../bootstrap/env";

@autoInjectable()
export default class Put extends Command {
  private readonly gameEvent: GameEventUseCase;
  constructor(
    store: CommandStore,
    file: string[],
    directory: string,
    @inject("GameEventUseCase") gameEvent: GameEventUseCase
  ) {
    super(store, file, directory, {
      usage: "<collectionName:string> <values:string>[...]",
      usageDelim: " ",
      runIn: ["text"],
      enabled: Boolean(GOOGLE_API_CREDENTIAL),
      requiredPermissions: ["SEND_MESSAGES"],
      description: (lang) => lang.get(LANG_KEYS.COMMAND_PUT_DESCRIPTION),
    });
    this.gameEvent = gameEvent;
  }
  public async run(
    msg: KlasaMessage,
    [collectionName, ...params]: string[]
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    const gsid: string = msg.guildSettings.get(googleSpreadSheetId);
    const list = await this.gameEvent.collection(gsid, collectionName);
    const arr: GameEvent[] = list.events;
    await this.gameEvent.put(gsid, collectionName, params);
    const rep = [
      `**${list.name.name}** ${list.kind}`,
      ...arr.map((e) => e.name),
    ].join("\n");
    return msg.sendMessage(rep);
  }
}
