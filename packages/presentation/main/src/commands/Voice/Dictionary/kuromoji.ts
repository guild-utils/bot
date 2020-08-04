import { CommandStore, KlasaMessage } from "klasa";
import { CommandEx } from "presentation_klasa-core-command-rewrite";
import * as LANG_KEYS from "../../../lang_keys";
import * as kuromoji from "kuromoji";
import { autoInjectable, inject } from "tsyringe";
function toFullWidth(elm: string) {
  return elm.replace(/[A-Za-z0-9!-~]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) + 0xfee0);
  });
}
@autoInjectable()
export default class extends CommandEx {
  constructor(
    store: CommandStore,
    file: string[],
    directory: string,
    @inject("kuromoji")
    private readonly tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures>
  ) {
    super(store, file, directory, {
      usage: "<text:string>",
      runIn: ["dm", "text"],
      description: (lang) => lang.get(LANG_KEYS.COMMAND_KUROMOJI_DESCRIPTION),
    });
  }
  public async run(
    msg: KlasaMessage,
    [text]: [string]
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    return msg.send(
      "```" +
        this.tokenizer
          .tokenize(toFullWidth(text))
          .map(
            (e) =>
              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              `${e.surface_form}(${e.pos} ${e.pos_detail_1} ${e.pos_detail_2} ${e.pos_detail_3},${e.reading},${e.pronunciation})`
          )
          .join(",") +
        "```"
    );
  }
}
