import { Argument, Possible, KlasaMessage, Command, CommandStore } from "klasa";
export type CategorizedCommandsEntry = {
  [subCategory in string]: {
    name: string;
    command: Command[];
  };
};
export type CategorizedCommands = {
  [category in string]: {
    name: string;
    subCategory: CategorizedCommandsEntry;
    direct: Command[];
  };
};
export type ReturnType =
  | CategorizedCommands[string]
  | CategorizedCommands[string]["subCategory"][string]
  | CategorizedCommands[string]["subCategory"][string]["command"][number]
  | undefined;
export default class extends Argument {
  run(
    arg: string | undefined,
    possible: Possible,
    message: KlasaMessage
  ): ReturnType {
    if (!arg) {
      return undefined;
    }
    const split = arg.split("/");
    const categorized = categorizeCommand(this.client.commands);
    if (split.length == 2) {
      const category = categorized[split[0].toLowerCase()];
      if (!category) {
        return undefined;
      }
      return (
        category.subCategory[split[1].toLowerCase()] ??
        category.direct.find(
          (cmd) =>
            cmd.name.toLowerCase() === split[1].toLowerCase() ||
            cmd.aliases
              .map((e) => e.toLowerCase())
              .includes(split[1].toLowerCase())
        ) ??
        category
      );
    }
    if (split.length === 3) {
      const categorized = categorizeCommand(this.client.commands);
      const category = categorized[split[0].toLowerCase()];
      if (!category) {
        return undefined;
      }
      const subCategory = category.subCategory[split[1].toLowerCase()];
      if (!subCategory) {
        return category;
      }
      return (
        subCategory.command.find(
          (cmd) =>
            cmd.name.toLowerCase() === split[1].toLowerCase() ||
            cmd.aliases
              .map((e) => e.toLowerCase())
              .includes(split[2].toLowerCase())
        ) ?? subCategory
      );
    }
    return categorized[arg.toLowerCase()];
  }
}
export function categorizeCommand(commands: CommandStore): CategorizedCommands {
  const r: CategorizedCommands = {};
  commands.forEach((e) => {
    const categoryL = e.category.toLowerCase();
    if (!r[categoryL]) {
      r[categoryL] = {
        name: e.category,
        subCategory: {},
        direct: [],
      };
    }
    if (e.subCategory) {
      const subCategoryL = e.subCategory.toLowerCase();
      if (!r[categoryL].subCategory[subCategoryL]) {
        r[categoryL].subCategory[subCategoryL] = {
          name: e.subCategory,
          command: [],
        };
      }
      r[categoryL].subCategory[subCategoryL].command.push(e);
    } else {
      r[categoryL].direct.push(e);
    }
  });
  return r;
}
