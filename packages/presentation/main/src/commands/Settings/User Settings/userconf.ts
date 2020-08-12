import { CommandEx } from "presentation_klasa-core-command-rewrite";
import { CommandStore } from "klasa";
import { KlasaMessage } from "klasa";
import { util } from "klasa";
import { SchemaFolder } from "klasa";
import { SettingsUpdateResult } from "klasa";

module.exports = class extends CommandEx {
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

  show(message: KlasaMessage, [key]: [string]) {
    const path = this.client.gateways.users.getPath(key, {
      avoidUnconfigurable: true,
      errors: false,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any
      piece: null as any,
    });
    if (!path) return message.sendLocale("COMMAND_CONF_GET_NOEXT", [key]);
    if (path.piece.type === "Folder") {
      return message.sendLocale("COMMAND_CONF_USER", [
        key
          ? `: ${key
              .split(".")
              .map((e) => util.toTitleCase(e))
              .join("/")}`
          : "",
        util.codeBlock(
          "asciidoc",
          message.author.settings.list(
            message,
            (path.piece as unknown) as SchemaFolder
          )
        ),
      ]);
    }
    return message.sendLocale("COMMAND_CONF_GET", [
      path.piece.path,
      message.author.settings.resolveString(message, path.piece),
    ]);
  }

  async set(message: KlasaMessage, [key, ...valueToSet]) {
    const status = await message.author.settings.update(
      key,
      valueToSet.join(" "),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      message.guild as any,
      { avoidUnconfigurable: true, action: "add" }
    );
    return (
      this.check(message, key, status) ||
      message.sendLocale("COMMAND_CONF_UPDATED", [
        key,
        message.author.settings.resolveString(message, status.updated[0].piece),
      ])
    );
  }

  async remove(message: KlasaMessage, [key, ...valueToRemove]) {
    const status = await message.author.settings.update(
      key,
      valueToRemove.join(" "),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      message.guild as any,
      { avoidUnconfigurable: true, action: "remove" }
    );
    return (
      this.check(message, key, status) ||
      message.sendLocale("COMMAND_CONF_UPDATED", [
        key,
        message.author.settings.resolveString(message, status.updated[0].piece),
      ])
    );
  }

  async reset(message: KlasaMessage, [key]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = await message.author.settings.reset(key, true as any);
    return (
      this.check(message, key, status) ||
      message.sendLocale("COMMAND_CONF_RESET", [
        key,
        message.author.settings.resolveString(message, status.updated[0].piece),
      ])
    );
  }

  check(
    message: KlasaMessage,
    key: string,
    { errors, updated }: SettingsUpdateResult
  ): null | Promise<KlasaMessage> {
    if (errors.length) return message.sendMessage(errors[0]);
    if (!updated.length)
      return message.sendLocale("COMMAND_CONF_NOCHANGE", [key]);
    return null;
  }
};
