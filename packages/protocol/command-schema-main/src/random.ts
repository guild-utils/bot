/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { MainParserContext } from "@guild-utils/command-parser";
import { CommandSchema } from "@guild-utils/command-schema";
import {
  argumentTypeExtendedSymbols,
  Base,
  NotResolvableError,
} from "@guild-utils/command-types";
import {
  computeLanguage,
  Context,
  runInServer,
  DescriptionData,
} from "protocol_command-schema-core";
const randomizerOverwriteSymbol = Symbol("randomizerOverwrite");
argumentTypeExtendedSymbols.add(randomizerOverwriteSymbol);
class AT_RandomizerOverwrite extends Base<
  typeof randomizerOverwriteSymbol,
  "member" | "user" | "none"
> {
  resolve(
    v: unknown,
    ctx: MainParserContext
  ): Promise<"member" | "user" | "none"> {
    const map: Record<string, "member" | "user" | "none" | undefined> = {
      member: "member",
      user: "user",
      none: "none",
      m: "member",
      u: "user",
      n: "none",
    };
    if (v == null) {
      return Promise.resolve("member");
    }
    const vv = map[String(v)];
    if (vv != null) {
      return Promise.resolve(vv);
    }
    return Promise.reject(new NotResolvableError());
  }
  name = "randomizerOverwrite";
  resolverKey: typeof randomizerOverwriteSymbol = randomizerOverwriteSymbol;
  yargs() {
    return {};
  }
}
export function random(
  f: (
    lang: string,
    ctx: Context
  ) => Record<"command" | "overwrite", DescriptionData>
) {
  return new CommandSchema("random", {
    descriptionResolver: computeLanguage(f, "command"),
    runIn: runInServer,
    alias: ["rand"],
  }).optional("overwrite", new AT_RandomizerOverwrite(), {
    descriptionResolver: computeLanguage(f, "overwrite"),
    alias: ["ow"],
  });
}
