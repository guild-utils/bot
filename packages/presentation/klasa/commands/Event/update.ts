import {Command,CommandStore,KlasaMessage} from 'klasa';
import {  inject, autoInjectable } from 'tsyringe';
import { GameEventUseCase } from 'usecase/game-event';
import {  GameEventNotificationRepository}from "pdomain/game-event";
import { googleSpreadSheetId } from '../../setting_keys';
import * as LANG_KEYS from "../../lang_keys";
@autoInjectable()
export default class extends Command{
    constructor(
        store: CommandStore,
        file: string[],
        directory: string,
        @inject("GameEventUseCase") private gameEventUseCase:GameEventUseCase,
        @inject("GameEventNotificationRepository") private notifyRepo:GameEventNotificationRepository
    ) {
        super(store,file,directory,{
            usage:"",
            description:lang=>lang.get(LANG_KEYS.COMMAND_UPDATE_DESCRIPTION)
        });
    }
    public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[] | null>{
        await this.notifyRepo.register(msg.guild!.id,(await this.gameEventUseCase.allEvents(await msg.guildSettings.get(googleSpreadSheetId))).map(e=>e[1]));
        return msg.sendLocale(LANG_KEYS.COMMAND_UPDATE_SUCCESS);
    }

}