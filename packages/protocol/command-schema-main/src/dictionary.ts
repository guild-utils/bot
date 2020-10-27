import {
  Base,
  argumentTypeExtendedSymbols,
  ArgumentTypeMismatchError,
  AT_Integer,
  AT_String,
} from "@guild-utils/command-types";
import type { Options, PositionalOptions } from "yargs";
import {
  computeLanguage,
  Context,
  DescriptionData,
  runInServer,
} from "protocol_command-schema-core";
import { CommandSchema } from "@guild-utils/command-schema";
const simpleDictionarySymbol = Symbol("simpleDictionary");
argumentTypeExtendedSymbols.add(simpleDictionarySymbol);
export type SimpleDictionaryEntryType = { from: string; to?: string };
export class AT_SimpleDictionary extends Base<
  typeof simpleDictionarySymbol,
  SimpleDictionaryEntryType
> {
  resolverKey: typeof simpleDictionarySymbol = simpleDictionarySymbol;
  name = "simpleDictionaryEntry";
  resolve(v: unknown): Promise<SimpleDictionaryEntryType> {
    function arrayToResult(xs: string[]) {
      const [from, to] = xs;
      if (!from) {
        throw new ArgumentTypeMismatchError();
      }

      return Promise.resolve({ from, to: to ?? "" });
    }
    if (Array.isArray(v)) {
      const xs = v.map(String);
      return arrayToResult(xs);
    } else {
      const x = String(v);
      const xs = x.split(",");
      return arrayToResult(xs);
    }
  }
  yargs(): PositionalOptions & Options {
    return {};
  }
}
const simpleDictionaryUpdateSymbol = Symbol("simpleDictionaryUpdate");
argumentTypeExtendedSymbols.add(simpleDictionaryUpdateSymbol);
export class AT_SimpleDictionaryUpdate extends Base<
  typeof simpleDictionaryUpdateSymbol,
  SimpleDictionaryEntryType | string
> {
  resolverKey: typeof simpleDictionaryUpdateSymbol = simpleDictionaryUpdateSymbol;
  name = "simpleDictionaryEntry";
  resolve(v: unknown): Promise<SimpleDictionaryEntryType | string> {
    function arrayToResult(xs: string[]) {
      const [from, to] = xs;
      if (!from) {
        throw new ArgumentTypeMismatchError();
      }
      if (to == null) {
        return Promise.resolve(from);
      }
      return Promise.resolve({ from, to: to });
    }
    if (Array.isArray(v)) {
      const xs = v.map(String);
      return arrayToResult(xs);
    } else {
      const x = String(v);
      const xs = x.split(",");
      return arrayToResult(xs);
    }
  }
  yargs(): PositionalOptions & Options {
    return {};
  }
}
const runIn = runInServer;
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function commandSimpleDictionary(
  k: "before" | "after",
  f: (
    lang: string,
    ctx: Context
  ) => Record<
    | "add"
    | "insert"
    | "index"
    | "entry"
    | "remove"
    | "update"
    | "list"
    | "command",
    DescriptionData
  >
) {
  const h = k[0];
  const addSchema = new CommandSchema("add", {
    descriptionResolver: computeLanguage(f, "add"),
    runIn,
  }).positional("entry", new AT_SimpleDictionary(), {
    descriptionResolver: computeLanguage(f, "entry"),
    variable: true,
  });
  const insertSchema = new CommandSchema("add", {
    descriptionResolver: computeLanguage(f, "add"),
    runIn,
  })
    .positional("index", new AT_Integer(), {
      descriptionResolver: computeLanguage(f, "index"),
    })
    .positional("entry", new AT_SimpleDictionary(), {
      descriptionResolver: computeLanguage(f, "entry"),
      variable: true,
    });
  const removeSchema = new CommandSchema("remove", {
    descriptionResolver: computeLanguage(f, "remove"),
    runIn,
  }).positional("index", new AT_Integer(), {
    descriptionResolver: computeLanguage(f, "index"),
  });
  const updateSchema = new CommandSchema("update", {
    descriptionResolver: computeLanguage(f, "update"),
    runIn,
  })
    .positional("index", new AT_Integer(), {
      descriptionResolver: computeLanguage(f, "index"),
    })
    .positional("entry", new AT_SimpleDictionaryUpdate(), {
      descriptionResolver: computeLanguage(f, "entry"),
      variable: true,
    });
  const listSchema = new CommandSchema("list", {
    descriptionResolver: computeLanguage(f, "list"),
    runIn,
  });
  return new CommandSchema(k + "-dictionary", {
    alias: [h + "dic"],
    descriptionResolver: computeLanguage(f, "command"),
    runIn,
    rateLimits: new Set([
      ["guild", 60, 60 * 1000],
      ["guild", 5, 3 * 1000],
    ]),
  })
    .command(addSchema)
    .command(insertSchema)
    .command(removeSchema)
    .command(updateSchema)
    .command(listSchema);
}
const mainDictionarySymbol = Symbol("mainDictionary");
argumentTypeExtendedSymbols.add(mainDictionarySymbol);
export type MainDictionaryEntryType = {
  to: string;
  p?: string;
  p1?: string;
  p2?: string;
  p3?: string;
};
export class AT_MainDictionary extends Base<
  typeof mainDictionarySymbol,
  MainDictionaryEntryType
> {
  resolverKey: typeof mainDictionarySymbol = mainDictionarySymbol;
  name = "mainDictionaryEntry";
  resolve(v: unknown): Promise<MainDictionaryEntryType> {
    function arrayToResult(xs: string[]) {
      const [to, p, p1, p2, p3] = xs;
      return Promise.resolve({ to: to ?? "", p, p1, p2, p3 });
    }
    if (Array.isArray(v)) {
      const xs = v.map(String);
      return arrayToResult(xs);
    } else {
      const x = String(v);
      const xs = x.split(",");
      return arrayToResult(xs);
    }
  }
  yargs(): PositionalOptions & Options {
    return {};
  }
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function commandMainDictionary(
  f: (
    lang: string,
    ctx: Context
  ) => Record<
    "add" | "key" | "entry" | "remove" | "update" | "list" | "command",
    DescriptionData
  >
) {
  const addSchema = new CommandSchema("add", {
    descriptionResolver: computeLanguage(f, "add"),
    runIn,
  })
    .positional("key", new AT_String(), {
      descriptionResolver: computeLanguage(f, "key"),
    })
    .positional("entry", new AT_MainDictionary(), {
      descriptionResolver: computeLanguage(f, "entry"),
      variable: true,
    });
  const removeSchema = new CommandSchema("remove", {
    descriptionResolver: computeLanguage(f, "remove"),
    runIn,
  }).positional("key", new AT_String(), {
    descriptionResolver: computeLanguage(f, "key"),
  });
  const updateSchema = new CommandSchema("update", {
    descriptionResolver: computeLanguage(f, "update"),
    runIn,
  })
    .positional("key", new AT_String(), {
      descriptionResolver: computeLanguage(f, "key"),
    })
    .positional("entry", new AT_MainDictionary(), {
      descriptionResolver: computeLanguage(f, "entry"),
    });
  const listSchema = new CommandSchema("list", {
    descriptionResolver: computeLanguage(f, "list"),
    runIn,
  });
  return new CommandSchema("main-dictionary", {
    alias: ["mdic"],
    descriptionResolver: computeLanguage(f, "command"),
    runIn,
    rateLimits: new Set([
      ["guild", 60, 60 * 1000],
      ["guild", 5, 3 * 1000],
    ]),
  })
    .command(addSchema)
    .command(removeSchema)
    .command(updateSchema)
    .command(listSchema);
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function commandDictionary(
  f: (
    lang: string,
    ctx: Context
  ) => Record<"export" | "import" | "command" | "clear", DescriptionData>
) {
  return new CommandSchema("dictionary", {
    descriptionResolver: computeLanguage(f, "command"),
    runIn: runInServer,
    alias: ["dic", "dict"],
    rateLimits: new Set([
      ["guild", 3 * 10, 60 * 10 * 1000],
      ["guild", 6, 60 * 1000],
    ]),
  })
    .command(
      new CommandSchema("export", {
        descriptionResolver: computeLanguage(f, "export"),
        runIn: runInServer,
      })
    )
    .command(
      new CommandSchema("import", {
        descriptionResolver: computeLanguage(f, "import"),
        runIn: runInServer,
      })
    )
    .command(
      new CommandSchema("clear", {
        descriptionResolver: computeLanguage(f, "clear"),
        runIn: runInServer,
      })
    );
}
