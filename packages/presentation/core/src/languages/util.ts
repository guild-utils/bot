import { EmbedFieldData } from "discord.js";
import { DeepEntry, HelpCommandCotext, HelpEntry } from "../commands/info/help";

export function buildBadge(
  name: string,
  type: HelpEntry["type"],
  entry: HelpEntry | undefined
): string {
  switch (type) {
    case "category":
      return `__\`\`${name}\`\`__`;
    case "command":
      return `\`\`${name}\`\``;
    case "deep": {
      const de = entry as DeepEntry;
      return buildBadge(name, de.visual, de.more(undefined));
    }
    case "documentation":
      return `_\`\`${name}\`\`_`;
  }
}
export function createFieldValueEntry(name: string, entry: HelpEntry): string {
  return buildBadge(name, entry.type, entry);
}
export function buildCategoryDescription(
  value: Map<string, HelpEntry>
): string {
  return [...value].map(([k, v]) => createFieldValueEntry(k, v)).join(" ");
}
export function createCategoryFields(
  lang: string,
  value: Map<string, HelpEntry>,
  ctx: HelpCommandCotext
): EmbedFieldData[] {
  return [...value].map(
    ([k, v]): EmbedFieldData => {
      return {
        name: v.type === "category" ? v.name(lang) : k,
        value: v.summary(lang)(ctx),
      };
    }
  );
}
