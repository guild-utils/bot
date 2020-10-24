/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { CommandSchema } from "@guild-utils/command-schema";
import { AT_String } from "@guild-utils/command-types";
import {
  computeLanguage,
  DescriptionData,
  runInEverywhere,
  Context,
} from "protocol_command-schema-core";
export function parsing(name: string) {
  return function (
    f: (
      lang: string,
      ctx: Context
    ) => Record<"command" | "text", DescriptionData>
  ) {
    return new CommandSchema(name, {
      descriptionResolver: computeLanguage(f, "command"),
      runIn: runInEverywhere,
    }).positional("text", new AT_String(), {
      descriptionResolver: computeLanguage(f, "text"),
      optional: false,
    });
  };
}

export const jumanpp = parsing("jumanpp");
export const kuromoji = parsing("kuromoji");
