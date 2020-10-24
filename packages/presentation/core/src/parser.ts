import { CommandContext } from "@guild-utils/command-base";
import {
  buildMainParser,
  buildYargsParser,
  MainParserContext,
} from "@guild-utils/command-parser";
import { CommandSchema } from "@guild-utils/command-schema";
import {
  argumentTypeExtendedSymbols,
  ArgumentTypeExtended,
} from "@guild-utils/command-types";
declare module "@guild-utils/command-parser" {
  interface MainParserContext {
    prefix: string;
    mentionPrefix: RegExp;
  }
}
declare module "@guild-utils/command-base" {
  interface CommandContext {
    runningCommand: string[];
    prefix: string;
  }
}
export function buildParser(
  schemas: CommandSchema<unknown[], Record<string, unknown>>[]
): (
  content: string,
  ctx: MainParserContext
) => Promise<
  [string, unknown[], Record<string, unknown>, CommandContext] | undefined
> {
  const yargs = buildYargsParser(
    schemas,
    (k, o) => {
      if (argumentTypeExtendedSymbols.has(k.resolverKey)) {
        return (k as ArgumentTypeExtended<symbol, unknown>).yargsOption(o);
      }
      throw new TypeError();
    },
    (k, o) => {
      if (argumentTypeExtendedSymbols.has(k.resolverKey)) {
        return (k as ArgumentTypeExtended<symbol, unknown>).yargsPosition(o);
      }
      throw new TypeError();
    }
  ).demandCommand();
  const rawParser = buildMainParser(
    schemas,
    (k, o, v, ctx) => {
      if (argumentTypeExtendedSymbols.has(k.resolverKey)) {
        return (k as ArgumentTypeExtended<symbol, unknown>).option(o, v, ctx);
      }
      throw new TypeError();
    },
    (k, o, v, ctx) => {
      if (argumentTypeExtendedSymbols.has(k.resolverKey)) {
        return (k as ArgumentTypeExtended<symbol, unknown>).position(o, v, ctx);
      }
      throw new TypeError();
    },
    yargs
  );
  return async (content: string, ctx: MainParserContext) => {
    let matchedPrefix: undefined | string = undefined;
    let match: RegExpMatchArray | null;
    if (content.startsWith(ctx.prefix)) {
      matchedPrefix = ctx.prefix;
    } else if ((match = content.match(ctx.mentionPrefix))) {
      matchedPrefix = match[0];
    } else {
      return;
    }
    const commandString = content.slice(matchedPrefix.length);
    const r = await rawParser(commandString.trim(), ctx);
    if (!r) {
      return undefined;
    }
    return [
      r[0][0],
      r[1],
      r[2],
      { prefix: matchedPrefix, runningCommand: r[0] },
    ];
  };
}
