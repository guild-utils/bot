/* eslint-disable @typescript-eslint/no-explicit-any */
import { Message } from "discord.js";
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CommandContext {}
export interface CommandBase {
  run(
    message: Message,
    positional: any[],
    option: Record<string, any>,
    ctx: CommandContext
  ): Promise<void>;
}
