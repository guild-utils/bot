import { PermissionError } from "@guild-utils/command-schema";
import { Channel, Guild, Permissions } from "discord.js";

export class SenderPermissionError extends PermissionError {
  constructor(
    public readonly required: Readonly<Permissions>,
    public readonly found: Readonly<Permissions>,
    public readonly place: Channel | Guild,
    message = "Command failed. Sender permission insufficient."
  ) {
    super(message);
  }
}
export class BotPermissionError extends PermissionError {
  constructor(
    public readonly required: Readonly<Permissions>,
    public readonly found: Readonly<Permissions>,
    public readonly place: Channel | Guild,
    message = "Command failed. Bot permission insufficient."
  ) {
    super(message);
  }
}
export class NotAllowedError extends PermissionError {
  constructor(message = "Command failed. Not allowed you.") {
    super(message);
  }
}
