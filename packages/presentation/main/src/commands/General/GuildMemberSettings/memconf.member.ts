/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Command,
  util,
  CommandStore,
  KlasaMessage,
  SchemaFolder,
  SettingsUpdateResult,
} from "klasa";
import { COMMAND_CONF_GUILD_MEMBER_DESCRIPTION } from "../../../lang_keys";
import { User } from "discord.js";
// eslint-disable-next-line @typescript-eslint/unbound-method
const { toTitleCase, codeBlock } = util;
export default class extends Command {
  constructor(store: CommandStore, file: string[], directory: string) {
    super(store, file, directory, {
      guarded: true,
      subcommands: true,
      runIn: ["text"],
      description: (language) =>
        language.get(COMMAND_CONF_GUILD_MEMBER_DESCRIPTION),
      permissionLevel: 6,
      usage:
        "<set|show|remove|reset> <user:user> (key:key) (value:value) [...]",
      aliases: ["memconf.m", "gmconf.m"],
      usageDelim: " ",
    });

    this.createCustomResolver("key", (arg, possible, message, [action]) => {
      if (action === "show" || arg) return arg;
      throw message.language.get("COMMAND_CONF_NOKEY");
    }).createCustomResolver("value", (arg, possible, message, [action]) => {
      if (!["set", "remove"].includes(action) || arg) return arg;
      throw message.language.get("COMMAND_CONF_NOVALUE");
    });
  }

  async show(
    message: KlasaMessage,
    [user, key]: [User, string]
  ): Promise<KlasaMessage> {
    const path = this.client.gateways.members.getPath(key, {
      avoidUnconfigurable: true,
      errors: false,
      piece: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    if (!path) return message.sendLocale("COMMAND_CONF_GET_NOEXT", [key]);
    const target = await message
      .guild!.members.fetch(user)
      .catch(() => undefined);
    if (!target) {
      return message.sendLocale("RESOLVER_INVALID_MEMBER", [user]);
    }
    await target.settings.sync();
    if (path.piece.type === "Folder") {
      return message.sendLocale("COMMAND_CONF_USER", [
        key ? `: ${key.split(".").map(toTitleCase).join("/")}` : "",
        codeBlock(
          "asciidoc",
          target.settings.list(message, (path.piece as unknown) as SchemaFolder)
        ),
      ]);
    }
    return message.sendLocale("COMMAND_CONF_GET", [
      path.piece.path,
      message.member!.settings.resolveString(message, path.piece),
    ]);
  }

  async set(
    message: KlasaMessage,
    [user, key, ...valueToSet]: [User, string]
  ): Promise<KlasaMessage> {
    const target = await message
      .guild!.members.fetch(user)
      .catch(() => undefined);
    if (!target) {
      return message.sendLocale("RESOLVER_INVALID_MEMBER", [user]);
    }
    await target.settings.sync();
    const status = await target.settings.update(
      key,
      valueToSet.join(" "),
      message,
      { avoidUnconfigurable: true, action: "add" }
    );
    return (
      this.check(message, key, status) ||
      message.sendLocale("COMMAND_CONF_UPDATED", [
        key,
        target.settings.resolveString(message, status.updated[0].piece),
      ])
    );
  }

  async remove(
    message: KlasaMessage,
    [user, key, ...valueToRemove]: [User, string]
  ): Promise<KlasaMessage> {
    const target = await message
      .guild!.members.fetch(user)
      .catch(() => undefined);
    if (!target) {
      return message.sendLocale("RESOLVER_INVALID_MEMBER", [user]);
    }
    await target.settings.sync();
    const status = await target.settings.update(
      key,
      valueToRemove.join(" "),
      message.guild ?? undefined,
      { avoidUnconfigurable: true, action: "remove" }
    );
    return (
      this.check(message, key, status) ||
      message.sendLocale("COMMAND_CONF_UPDATED", [
        key,
        target.settings.resolveString(message, status.updated[0].piece),
      ])
    );
  }

  async reset(
    message: KlasaMessage,
    [user, key]: [User, string]
  ): Promise<KlasaMessage> {
    const target = await message
      .guild!.members.fetch(user)
      .catch(() => undefined);
    if (!target) {
      return message.sendLocale("RESOLVER_INVALID_MEMBER", [user]);
    }
    await target.settings.sync();
    const status = await target.settings.reset(key);
    return (
      this.check(message, key, status) ||
      message.sendLocale("COMMAND_CONF_RESET", [
        key,
        target.settings.resolveString(message, status.updated[0].piece),
      ])
    );
  }

  check(
    message: KlasaMessage,
    key: string,
    { errors, updated }: SettingsUpdateResult
  ): Promise<KlasaMessage> | null {
    if (errors.length) return message.sendMessage(errors[0]);
    if (!updated.length)
      return message.sendLocale("COMMAND_CONF_NOCHANGE", [key]);
    return null;
  }
}
