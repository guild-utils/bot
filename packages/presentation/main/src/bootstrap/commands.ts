import { DependencyContainer } from "tsyringe";
import {
  buildParser,
  CommandFromSchemaCtx,
  configureCategoryValue,
  infoCategoryValue,
  CoreCommandOptions,
  rootCategory,
  infoCategory,
  commandsToMapWithName,
  configurateCategory,
  voiceCategoryValue,
  voiceCategory,
  commandFromSchema,
  initConfCommand,
  InitConfCommandArg,
  CommandResolver,
  commandTextSupplier,
  CommandLogger,
  BotLogger,
} from "presentation_core";
import {
  categoryWords,
  initMainCommands,
  MainCommandOptions,
} from "./main-commands";
import { CommandSchema } from "@guild-utils/command-schema";
import { Client } from "discord.js";
import { CommandBase } from "@guild-utils/command-base";
import {
  initCoreCommands,
  createCommandCollectionWithAlias,
  commandsToMapWithNameAndAlias,
  RateLimitLangJaJP,
  RateLimitEntrys,
} from "presentation_core";
import {
  CoreCommands,
  defineConfCommandSchema,
  defineCoreCommandSchema,
} from "protocol_command-schema-core-bootstrap";
import {
  defineMainCommandSchema,
  MainCommands,
} from "protocol_command-schema-main-bootstrap";
const Logger = CommandLogger.child({ type: "resolver" });
export function initCommands(
  coreCommandOptions: CoreCommandOptions,
  mainCommandOptions: MainCommandOptions,
  initConfCommandArgs: InitConfCommandArg
): Record<string, CommandBase> {
  return {
    ...initCoreCommands(coreCommandOptions),
    ...initMainCommands(mainCommandOptions),
    ...initConfCommand(
      {
        guild: true,
        member: true,
        user: true,
      },
      initConfCommandArgs
    ),
  };
}
function initCommandParser(
  container: DependencyContainer,
  schemas: CommandSchema[]
) {
  const parser = buildParser(schemas);
  container.register("CommandParser", {
    useValue: parser,
  });
  return parser;
}
function initCommandResolver(
  container: DependencyContainer,
  collection: Map<
    string,
    [CommandBase, CommandSchema | undefined, RateLimitEntrys | undefined]
  >
): CommandResolver {
  const resolverFunc = (k: string) => {
    Logger.info(k);
    const resolvers = [collection];
    for (const resolver of resolvers) {
      const cmdBase = resolver.get(k);
      if (cmdBase) {
        return cmdBase;
      }
    }
  };
  container.register("CommandResolver", {
    useValue: resolverFunc,
  });
  return resolverFunc;
}
export type Schemas = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  coreSchema: Record<CoreCommands, CommandSchema<[], {}>>;
  // eslint-disable-next-line @typescript-eslint/ban-types
  mainSchema: Record<MainCommands, CommandSchema<[], {}>>;
  // eslint-disable-next-line @typescript-eslint/ban-types
  confSchema: Record<string, CommandSchema<[], {}> | undefined>;
};
export function defineSchemas(client: () => Client): Schemas {
  const coreSchema = defineCoreCommandSchema(client);
  const mainSchema = defineMainCommandSchema();
  const confSchema = defineConfCommandSchema(
    {
      guild: true,
      member: true,
      user: true,
    },
    client
  );
  return {
    coreSchema,
    mainSchema,
    confSchema,
  };
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function initCommandSystem(
  container: DependencyContainer,
  { confSchema, coreSchema, mainSchema }: Schemas,
  partialCoreCommandOptions: Omit<
    CoreCommandOptions,
    "flatten" | "rootCategory"
  >,
  mainCommandOptions: MainCommandOptions,
  initConfCommandArgs: InitConfCommandArg,
  ctx: CommandFromSchemaCtx
) {
  const schema = {
    ...coreSchema,
    ...mainSchema,
    ...confSchema,
  };
  const infoValue = infoCategoryValue(coreSchema, ctx);
  const infoCat = infoCategory(
    ctx.color,
    commandsToMapWithNameAndAlias(infoValue),
    ...commandsToMapWithName(infoValue)
  );
  const configurateValueCore = configureCategoryValue(coreSchema, ctx);

  const configurateValue = [
    ...configurateValueCore,
    ...Object.values(confSchema)
      .filter((e): e is CommandSchema => e != null)
      .map((e) => commandFromSchema(e, "Configurate", ctx)),
  ];
  const confCat = configurateCategory(
    ctx.color,
    commandsToMapWithNameAndAlias(configurateValue),
    ...commandsToMapWithName(configurateValue)
  );
  const voiceValue = voiceCategoryValue(coreSchema, ctx);
  const voiceCat = voiceCategory(
    ctx.color,
    commandsToMapWithNameAndAlias(voiceValue),
    ...commandsToMapWithName(voiceValue)
  );
  const wordsValue = Object.values(mainSchema).map((e) =>
    commandFromSchema(e, "Words", ctx)
  );
  const wordsCat = categoryWords(
    ctx.color,
    commandsToMapWithNameAndAlias(wordsValue),
    ...commandsToMapWithName(wordsValue)
  );
  const rootValue = new Map([
    ["botinfo", infoCat],
    ["configurate", confCat],
    ["voice", voiceCat],
    ["words", wordsCat],
  ]);
  const helpReolverCommands = commandsToMapWithNameAndAlias([
    ...infoValue,
    ...configurateValue,
    ...voiceValue,
    ...wordsValue,
  ]);
  const flatten = new Map([...helpReolverCommands, ...rootValue]);
  const command = initCommands(
    Object.assign({}, partialCoreCommandOptions, {
      flatten,
      rootCategory: rootCategory(ctx.color, rootValue, rootValue),
    }),
    mainCommandOptions,
    initConfCommandArgs
  );
  const collection = createCommandCollectionWithAlias(
    command,
    schema,
    commandTextSupplier({
      ja_JP: RateLimitLangJaJP(ctx.color),
    })
  );
  BotLogger.info(`Command Collection Size: ${collection.size}`);
  const parser = initCommandParser(container, Object.values(schema));
  const resolver = initCommandResolver(container, collection);
  return { parser, resolver };
}
