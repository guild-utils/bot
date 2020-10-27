/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { CommandSchema } from "@guild-utils/command-schema";
import { AT_SimpleArray, AT_String } from "@guild-utils/command-types";
import { Context, DescriptionData } from "./common";
import { computeLanguage, createSimpleCommand, runInEverywhere } from "./util";

export function commandHelp(
  f: (lang: string, ctx: Context) => Record<"command" | "key", DescriptionData>
) {
  return new CommandSchema("help", {
    descriptionResolver: computeLanguage(f, "command"),
    runIn: runInEverywhere,
    alias: ["h", "commands", "command", "categorys", "category"],
  }).positional("key", new AT_SimpleArray(new AT_String()), {
    variable: true,
    descriptionResolver: computeLanguage(f, "key"),
  });
}
export function commandInfo(
  f: (lang: string, ctx: Context) => Record<"command", DescriptionData>
) {
  return new CommandSchema("info", {
    descriptionResolver: computeLanguage(f, "command"),
    runIn: runInEverywhere,
    alias: ["details", "what"],
  });
}

export const commandInvite = createSimpleCommand("invite");
export const commandPing = createSimpleCommand("ping");
export const commandStats = createSimpleCommand("stats");
