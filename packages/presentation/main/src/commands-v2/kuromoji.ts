import { Message } from "discord.js";
import * as kuromoji from "kuromoji";
import { autoInjectable, inject } from "tsyringe";
import { CommandBase } from "@guild-utils/command-base";

function toFullWidth(elm: string) {
  return elm.replace(/[A-Za-z0-9!-~]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) + 0xfee0);
  });
}
@autoInjectable()
export class KuromojiCommand implements CommandBase {
  constructor(
    @inject("kuromoji")
    private readonly tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures>
  ) {}
  public async run(msg: Message, [text]: [string]): Promise<void> {
    await msg.send(
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
