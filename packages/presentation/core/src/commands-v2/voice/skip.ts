import { CommandBase } from "@guild-utils/command-base";
import { Message } from "discord.js";
import Engine from "../../text2speech/engine";

export class CommandSkip implements CommandBase {
  constructor(private readonly engine: Engine) {}
  public async run(msg: Message): Promise<void> {
    const conn = msg.guild?.voice?.connection;
    if (conn) {
      await this.engine.skip(conn);
    }
  }
}
