import { CommandSchema } from "@guild-utils/command-schema";
import { Context, DescriptionData } from "./common";

export const runInEverywhere: Set<"text" | "news" | "dm"> = new Set([
  "text",
  "news",
  "dm",
]);
export const runInServer: Set<"text" | "news"> = new Set(["text", "news"]);
export const runInDirectMail: Set<"dm"> = new Set(["dm"]);
export function computeLanguage<T extends Record<string, DescriptionData>>(
  f: (lang: string, ctx: Context) => T,
  k: keyof T
): (lang: string, ctx: Context) => DescriptionData {
  return (lang, ctx) => f(lang, ctx)[k];
}
export function createSimpleCommand(
  name: string,
  opt?: {
    runIn?: Set<"text" | "news" | "dm">;
    alias?: string[] | undefined;
  }
) {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  return function command(
    f: (lang: string, ctx: Context) => Record<"command", DescriptionData>
  ) {
    return new CommandSchema(name, {
      descriptionResolver: computeLanguage(f, "command"),
      runIn: opt?.runIn ?? runInEverywhere,
      alias: opt?.alias,
    });
  };
}
