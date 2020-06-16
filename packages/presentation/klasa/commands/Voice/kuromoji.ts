import {Command,CommandStore,KlasaMessage} from 'klasa';
import * as LANG_KEYS from "../../lang_keys";
import * as kuromoji from "kuromoji";
import { autoInjectable, inject } from 'tsyringe';
@autoInjectable()
export default class extends Command{
    constructor(
        store: CommandStore,
        file: string[],
        directory: string,
        @inject("kuromoji") private readonly tokenizer:kuromoji.Tokenizer<kuromoji.IpadicFeatures>
    ) {
        super(store,file,directory,{
            usage:"<text:string>",
            runIn:["dm","text"],
            description:lang=>lang.get(LANG_KEYS.COMMAND_KUROMOJI_DESCRIPTION)
        });
    }
    public async run(msg: KlasaMessage,[text]:[string]): Promise<KlasaMessage | KlasaMessage[] | null>{
        console.log(text)
        return msg.send("```"+this.tokenizer.tokenize(text).map(e=>`${e.surface_form}(${e.pos},${e.pos_detail_1},${e.pos_detail_2},${e.pos_detail_3},${e.reading},${e.pronunciation})`).join(",")+"```");
    }

}