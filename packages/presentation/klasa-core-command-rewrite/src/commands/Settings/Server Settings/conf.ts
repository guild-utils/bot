import { CommandStore } from "klasa";
import { KlasaMessage } from "klasa";
import { util } from "klasa";
import { SchemaFolder } from "klasa";
import { SettingsUpdateResult } from "klasa";
import { CommandEx } from "../../../commandEx";

export default class extends CommandEx {
  constructor(store: CommandStore, file: string[], directory: string) {
    super(store, file, directory, {
      subcommands: true,
    });
    this.createCustomResolver("key", (arg, possible, message, [action]) => {
      if (action === "show" || arg) return arg;
      throw message.language.get("COMMAND_CONF_NOKEY");
    }).createCustomResolver("value", (arg, possible, message, [action]) => {
      if (!["set", "remove"].includes(action) || arg) return arg;
      throw message.language.get("COMMAND_CONF_NOVALUE");
    });
  }

  show(message: KlasaMessage, [key]: [string]): Promise<KlasaMessage> {
    const path = this.client.gateways.guilds.getPath(key, {
      avoidUnconfigurable: true,
      errors: false,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      piece: null as any,
    });
    if (!path) return message.sendLocale("COMMAND_CONF_GET_NOEXT", [key]);
    if (path.piece.type === "Folder") {
      return message.sendLocale("COMMAND_CONF_SERVER", [
        key
          ? `: ${key
              .split(".")
              .map((e) => util.toTitleCase(e))
              .join("/")}`
          : "",
        util.codeBlock(
          "asciidoc",
          message.guild!.settings.list(
            message,
            (path.piece as unknown) as SchemaFolder
          )
        ),
      ]);
    }
    return message.sendLocale("COMMAND_CONF_GET", [
      path.piece.path,
      message.guild!.settings.resolveString(message, path.piece),
    ]);
  }

  async set(
    message: KlasaMessage,
    [key, ...valueToSet]: string[]
  ): Promise<KlasaMessage | null> {
    const status = await message.guild!.settings.update(
      key,
      valueToSet.join(" "),
      message.guild!,
      { avoidUnconfigurable: true, action: "add" }
    );
    return (
      this.check(message, key, status) ||
      message.sendLocale("COMMAND_CONF_UPDATED", [
        key,
        message.guild!.settings.resolveString(message, status.updated[0].piece),
      ])
    );
  }

  async remove(
    message: KlasaMessage,
    [key, ...valueToRemove]: string[]
  ): Promise<KlasaMessage | null> {
    const status = await message.guild!.settings.update(
      key,
      valueToRemove.join(" "),
      message.guild!,
      { avoidUnconfigurable: true, action: "remove" }
    );
    return (
      this.check(message, key, status) ||
      message.sendLocale("COMMAND_CONF_UPDATED", [
        key,
        message.guild!.settings.resolveString(message, status.updated[0].piece),
      ])
    );
  }

  async reset(
    message: KlasaMessage,
    [key]: string[]
  ): Promise<KlasaMessage | null> {
    const status = await message.guild!.settings.reset(
      key,
      message.guild!,
      true as any
    );
    return (
      this.check(message, key, status) ||
      message.sendLocale("COMMAND_CONF_RESET", [
        key,
        message.guild!.settings.resolveString(message, status.updated[0].piece),
      ])
    );
  }

  check(
    message: KlasaMessage,
    key: string,
    { errors, updated }: SettingsUpdateResult
  ): Promise<KlasaMessage> | null {
    if (errors.length) return message.sendMessage(String(errors[0]));
    if (!updated.length)
      return message.sendLocale("COMMAND_CONF_NOCHANGE", [key]);
    return null;
  }
}
