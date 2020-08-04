import { CommandDataCollectionProvider } from "presentation_command-data-common";
import { CommandOptionsCollection } from "presentation_klasa-core-command-rewrite";
import { CommandOptions, Language } from "klasa";

export class CommandDataCollectionProxy implements CommandOptionsCollection {
  constructor(private readonly provider: CommandDataCollectionProvider) {}
  get(key: string): CommandOptions {
    const {
      name,
      aliases,
      description,
      cooldown,
      cooldownLevel,
      guarded,
      more,
      permissionLevel,
      runIn,
      usage,
      usageDelim,
    } = this.provider.get("ww").get(key);
    return {
      name,
      aliases,
      cooldown,
      cooldownLevel,
      description: (lang: Language) =>
        this.provider.get(lang.name).get(key).description ?? description ?? "",
      extendedHelp: (lang: Language) =>
        this.provider.get(lang.name).get(key).more ?? more ?? "",
      guarded,
      permissionLevel,
      runIn,
      usage,
      usageDelim,
    };
  }
}
