import { EmbedFieldData } from "discord.js";
import { HelpCommandCotext, HelpEntry } from "../commands-v2/info/help";

export function buildBadge(
  name: string,
  type: HelpEntry["type"],
  entry: HelpEntry
): string {
  switch (type) {
    case "category":
      return `__\`\`${name}\`\`__`;
    case "command":
      return `\`\`${name}\`\``;
    case "deep":
      return buildBadge(name, entry.type, entry);
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
