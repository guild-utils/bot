import { Argument, Possible, KlasaMessage, Command, CommandStore } from "klasa";
export type CategorizedCommandsEntry = {
  [subCategory in string]: {
    categoryName: string;
    name: string;
    command: Command[];
  };
};
export type CategorizedCommands = {
  category:{
    [category in string]: {
      name: string;
      subCategory: CategorizedCommandsEntry;
      direct: Command[];
    };
  },
  direct:Command[]
};
export type ReturnType =
  | CategorizedCommands["category"][string]
  | CategorizedCommands["category"][string]["subCategory"][string]
  | CategorizedCommands["category"][string]["subCategory"][string]["command"][number]
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
      const category = categorized.category[split[0].toLowerCase()];
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
      const category = categorized.category[split[0].toLowerCase()];
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
            cmd.name.toLowerCase() === split[2].toLowerCase() ||
            cmd.aliases
              .map((e) => e.toLowerCase())
              .includes(split[2].toLowerCase())
        ) ?? subCategory
      );
    }
    return categorized[arg.toLowerCase()];
  }
}
let cacheedCategorizeCommand:CategorizedCommands|undefined;
export function categorizeCommand(commands: CommandStore): CategorizedCommands {
  if(cacheedCategorizeCommand){
    return cacheedCategorizeCommand;
  }
  const r: CategorizedCommands = {
    category:{},
    direct:[]
  };
  commands.forEach((e) => {
    if(!e.category){
      r.direct.push(e);
      return;
    }
    const categoryL = e.category.toLowerCase();
    if (!r.category[categoryL]) {
      r.category[categoryL] = {
        name: e.category,
        subCategory: {},
        direct: [],
      };
    }
    if (e.subCategory) {
      const subCategoryL = e.subCategory.toLowerCase();
      if (!r.category[categoryL].subCategory[subCategoryL]) {
        r.category[categoryL].subCategory[subCategoryL] = {
          categoryName: e.category,
          name: e.subCategory,
          command: [],
        };
      }
      r.category[categoryL].subCategory[subCategoryL].command.push(e);
    } else {
      r.category[categoryL].direct.push(e);
    }
  });
  cacheedCategorizeCommand=r;
  return r;
}
