/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Argument, Possible, KlasaMessage } from "klasa";
import { CommandData } from "presentation_command-data-common";
export type CategorizedCommandsEntry = {
  [subCategory in string]:
    | {
        categoryName: string;
        name: string;
        command: CommandData[];
      }
    | undefined;
};
export type CategorizedCommands = {
  category: {
    [category in string]:
      | {
          name: string;
          subCategory: CategorizedCommandsEntry;
          direct: CommandData[];
        }
      | undefined;
  };
  subCategory: CategorizedCommandsEntry;
  direct: CommandData[];
};
export type ReturnType =
  | CategorizedCommands["category"][string]
  | NonNullable<CategorizedCommands["category"][string]>["subCategory"][string]
  | NonNullable<
      NonNullable<
        CategorizedCommands["category"][string]
      >["subCategory"][string]
    >["command"][number]
  | undefined;
export default class extends Argument {
  run(
    arg: string | undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _possible: Possible,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    message: KlasaMessage
  ): ReturnType {
    if (!arg) {
      return undefined;
    }
    const split = arg.split("/");
    const categorized = categorizeCommand(
      message.language.name,
      this.client.options.allCommands[message.language.name]
    );
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
            (cmd.aliases ?? [])
              .map((e) => e.toLowerCase())
              .includes(split[1].toLowerCase())
        ) ??
        category
      );
    }
    if (split.length === 3) {
      const categorized = categorizeCommand(
        message.language.name,
        this.client.options.allCommands[message.language.name]
      );
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
            (cmd.aliases ?? [])
              .map((e) => e.toLowerCase())
              .includes(split[2].toLowerCase())
        ) ?? subCategory
      );
    }
    return (
      categorized.category[arg.toLowerCase()] ??
      categorized.subCategory[arg.toLowerCase()]
    );
  }
}
const cachedCategorizeCommand: {
  [lang in string]: CategorizedCommands | undefined;
} = {};
export function categorizeCommand(
  lang: string,
  commands: CommandData[]
): CategorizedCommands {
  const cccl = cachedCategorizeCommand[lang];
  if (cccl) {
    return cccl;
  }
  const r: CategorizedCommands = {
    category: {},
    direct: [],
    subCategory: {},
  };
  commands.forEach((e) => {
    if (!e.category) {
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
      if (!r.category[categoryL]!.subCategory[subCategoryL]) {
        r.category[categoryL]!.subCategory[subCategoryL] = {
          categoryName: e.category,
          name: e.subCategory,
          command: [],
        };
      }
      r.category[categoryL]!.subCategory[subCategoryL]!.command.push(e);
    } else {
      r.category[categoryL]!.direct.push(e);
    }
  });
  Object.values(r.category).forEach((categoryValue) => {
    if (!categoryValue) {
      return;
    }
    Object.entries(categoryValue.subCategory).forEach(
      ([subCategoryNameL, subCategoryValue]) => {
        if (r.subCategory[subCategoryNameL]) {
          throw new Error("duplicate subcategory name");
        }
        r.subCategory[subCategoryNameL] = subCategoryValue;
      }
    );
  });
  cachedCategorizeCommand[lang] = r;
  return r;
}
