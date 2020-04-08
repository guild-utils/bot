import {Command,CommandStore,KlasaMessage} from 'klasa'
import {  GameEventNotifyRepository}from "pdomain/game-event"
import {  inject, autoInjectable } from 'tsyringe';
import { GameEventUseCase } from 'usecase/lib/game-event';
import { googleSpreadSheetId } from '../../../settings';
@autoInjectable()
export default class extends Command{
    constructor(
        store: CommandStore,
        file: string[],
        directory: string,
        @inject("GameEventUseCase") private gameEventUseCase:GameEventUseCase,
        @inject("GameEventNotifyRepository") private notifyRepo:GameEventNotifyRepository
    ) {
        super(store,file,directory,{
            usage:""
        });
    }
    public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[] | null>{
        await this.notifyRepo.register(msg.guild!.id,await this.gameEventUseCase.allEvents(await msg.guildSettings.get(googleSpreadSheetId)));
        return msg.sendMessage("updated!");
    }

}