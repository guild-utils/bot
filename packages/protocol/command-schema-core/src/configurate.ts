/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { CommandSchema } from "@guild-utils/command-schema";
import {
  AT_String,
  AT_SimpleArray,
  AT_Or,
  AT_Flag,
} from "@guild-utils/command-types";
import { AT_Member } from "@guild-utils/command-types-discord.js";
import type { Client } from "discord.js";
import { Context, DescriptionData } from "./common";
import { computeLanguage, runInEverywhere, runInServer } from "./util";

function applyMSU(
  schema: CommandSchema,
  f: (
    lang: string,
    ctx: Context
  ) => Record<"member" | "user" | "server", DescriptionData>,
  client: () => Client
) {
  return schema
    .optional("member", new AT_Or(new AT_Flag(), new AT_Member(client)), {
      descriptionResolver: computeLanguage(f, "member"),
      alias: ["m", "gm", "guildMember"],
    })
    .optional("user", new AT_Flag(), {
      descriptionResolver: computeLanguage(f, "user"),
      alias: ["u"],
    })
    .optional("server", new AT_Flag(), {
      descriptionResolver: computeLanguage(f, "server"),
      alias: ["s", "guild", "g"],
    });
}
export function commandSet(
  f: (
    lang: string,
    ctx: Context
  ) => Record<
    "key" | "value" | "command" | "member" | "user" | "server",
    DescriptionData
  >,
  client: () => Client
) {
  return applyMSU(
    new CommandSchema("set", {
      descriptionResolver: computeLanguage(f, "command"),
      runIn: runInEverywhere,
    })
      .positional("key", new AT_String(), {
        descriptionResolver: computeLanguage(f, "key"),
      })
      .positional("value", new AT_SimpleArray(new AT_String()), {
        descriptionResolver: computeLanguage(f, "value"),
        variable: true,
      }),
    f,
    client
  );
}
export function commandGet(
  f: (
    lang: string,
    ctx: Context
  ) => Record<
    "key" | "command" | "member" | "user" | "server",
    DescriptionData
  >,
  client: () => Client
) {
  return applyMSU(
    new CommandSchema("get", {
      descriptionResolver: computeLanguage(f, "command"),
      runIn: runInEverywhere,
      alias: ["show"],
    }).positional("key", new AT_String(), {
      descriptionResolver: computeLanguage(f, "key"),
    }),
    f,
    client
  );
}
export function commandAdd(
  f: (
    lang: string,
    ctx: Context
  ) => Record<
    "value" | "key" | "command" | "member" | "user" | "server",
    DescriptionData
  >,
  client: () => Client
) {
  return applyMSU(
    new CommandSchema("add", {
      descriptionResolver: computeLanguage(f, "command"),
      alias: ["push"],
      runIn: runInEverywhere,
    })
      .positional("key", new AT_String(), {
        descriptionResolver: computeLanguage(f, "key"),
      })
      .positional("value", new AT_String(), {
        descriptionResolver: computeLanguage(f, "value"),
      }),
    f,
    client
  );
}
export function commandRemove(
  f: (
    lang: string,
    ctx: Context
  ) => Record<
    "value" | "key" | "command" | "member" | "user" | "server",
    DescriptionData
  >,
  client: () => Client
) {
  return applyMSU(
    new CommandSchema("remove", {
      descriptionResolver: computeLanguage(f, "command"),
      alias: ["delete", "pop"],
      runIn: runInEverywhere,
    })
      .positional("key", new AT_String(), {
        descriptionResolver: computeLanguage(f, "key"),
      })
      .positional("value", new AT_String(), {
        descriptionResolver: computeLanguage(f, "value"),
      }),
    f,
    client
  );
}
export function commandReset(
  f: (
    lang: string,
    ctx: Context
  ) => Record<
    "key" | "command" | "member" | "user" | "server",
    DescriptionData
  >,
  client: () => Client
) {
  return applyMSU(
    new CommandSchema("reset", {
      descriptionResolver: computeLanguage(f, "command"),
      alias: ["clear"],
      runIn: runInEverywhere,
    }).positional("key", new AT_String(), {
      descriptionResolver: computeLanguage(f, "key"),
    }),
    f,
    client
  );
}
export function commandConfBase(
  baseSchema: CommandSchema,
  runIn: Set<"text" | "news" | "dm">,
  f: (
    lang: string,
    ctx: Context
  ) => Record<
    "key" | "add" | "get" | "remove" | "reset" | "set" | "value",
    DescriptionData
  >
) {
  return baseSchema
    .command(
      new CommandSchema("add", {
        descriptionResolver: computeLanguage(f, "add"),
        runIn,
      })
        .positional("key", new AT_String(), {
          descriptionResolver: computeLanguage(f, "key"),
        })
        .positional("value", new AT_String(), {
          descriptionResolver: computeLanguage(f, "value"),
        })
    )
    .command(
      new CommandSchema("set", {
        descriptionResolver: computeLanguage(f, "set"),
        runIn,
      })
        .positional("key", new AT_String(), {
          descriptionResolver: computeLanguage(f, "key"),
        })
        .positional("value", new AT_SimpleArray(new AT_String()), {
          descriptionResolver: computeLanguage(f, "value"),
          variable: true,
        })
    )
    .command(
      new CommandSchema("reset", {
        descriptionResolver: computeLanguage(f, "reset"),
        runIn,
      }).positional("key", new AT_String(), {
        descriptionResolver: computeLanguage(f, "key"),
      })
    )
    .command(
      new CommandSchema("get", {
        descriptionResolver: computeLanguage(f, "get"),
        runIn,
      }).positional("key", new AT_String(), {
        descriptionResolver: computeLanguage(f, "key"),
      })
    )
    .command(
      new CommandSchema("remove", {
        descriptionResolver: computeLanguage(f, "remove"),
        runIn,
      })
        .positional("key", new AT_String(), {
          descriptionResolver: computeLanguage(f, "key"),
        })
        .positional("value", new AT_String(), {
          descriptionResolver: computeLanguage(f, "value"),
        })
    )
    .needSubCommand();
}
export function commandConf(
  f: (
    lang: string,
    ctx: Context
  ) => Record<
    "command" | "key" | "add" | "get" | "remove" | "reset" | "set" | "value",
    DescriptionData
  >
) {
  return commandConfBase(
    new CommandSchema("conf", {
      descriptionResolver: computeLanguage(f, "command"),
      runIn: runInServer,
      alias: ["sconf", "gconf"],
    }),
    runInServer,
    f
  );
}
export function commandMemconf(
  f: (
    lang: string,
    ctx: Context
  ) => Record<
    "command" | "key" | "add" | "get" | "remove" | "reset" | "set" | "value",
    DescriptionData
  >
) {
  return commandConfBase(
    new CommandSchema("memconf", {
      descriptionResolver: computeLanguage(f, "command"),
      runIn: runInServer,
      alias: ["gmconf", "mconf"],
    }),
    runInServer,
    f
  );
}
export function commandUserconf(
  f: (
    lang: string,
    ctx: Context
  ) => Record<
    "command" | "key" | "add" | "get" | "remove" | "reset" | "set" | "value",
    DescriptionData
  >
) {
  return commandConfBase(
    new CommandSchema("userconf", {
      descriptionResolver: computeLanguage(f, "command"),
      runIn: runInEverywhere,
      alias: ["uconf"],
    }),
    runInEverywhere,
    f
  );
}
export function commandMemconfMember(
  f: (
    lang: string,
    ctx: Context
  ) => Record<
    | "key"
    | "command"
    | "add"
    | "get"
    | "remove"
    | "reset"
    | "set"
    | "value"
    | "member",
    DescriptionData
  >,
  client: () => Client
) {
  const runIn = runInServer;
  return new CommandSchema("memconf.member", {
    descriptionResolver: computeLanguage(f, "command"),
    runIn,
    alias: ["memconf.member", "memconf.m", "gmconf.m"],
  })
    .command(
      new CommandSchema("add", {
        descriptionResolver: computeLanguage(f, "add"),
        runIn,
      })
        .positional("member", new AT_Member(client), {
          descriptionResolver: computeLanguage(f, "member"),
        })
        .positional("key", new AT_String(), {
          descriptionResolver: computeLanguage(f, "key"),
        })
        .positional("value", new AT_String(), {
          descriptionResolver: computeLanguage(f, "value"),
        })
    )
    .command(
      new CommandSchema("set", {
        descriptionResolver: computeLanguage(f, "set"),
        runIn,
      })
        .positional("member", new AT_Member(client), {
          descriptionResolver: computeLanguage(f, "member"),
        })
        .positional("key", new AT_String(), {
          descriptionResolver: computeLanguage(f, "key"),
        })
        .positional("value", new AT_SimpleArray(new AT_String()), {
          descriptionResolver: computeLanguage(f, "value"),
          variable: true,
        })
    )
    .command(
      new CommandSchema("reset", {
        descriptionResolver: computeLanguage(f, "reset"),
        runIn,
      })
        .positional("member", new AT_Member(client), {
          descriptionResolver: computeLanguage(f, "member"),
        })
        .positional("key", new AT_String(), {
          descriptionResolver: computeLanguage(f, "key"),
        })
    )
    .command(
      new CommandSchema("get", {
        descriptionResolver: computeLanguage(f, "get"),
        runIn,
      })
        .positional("member", new AT_Member(client), {
          descriptionResolver: computeLanguage(f, "member"),
        })
        .positional("key", new AT_String(), {
          descriptionResolver: computeLanguage(f, "key"),
        })
    )
    .command(
      new CommandSchema("remove", {
        descriptionResolver: computeLanguage(f, "remove"),
        runIn,
      })
        .positional("member", new AT_Member(client), {
          descriptionResolver: computeLanguage(f, "member"),
        })
        .positional("key", new AT_String(), {
          descriptionResolver: computeLanguage(f, "key"),
        })
        .positional("value", new AT_String(), {
          descriptionResolver: computeLanguage(f, "value"),
        })
    )
    .needSubCommand();
}
