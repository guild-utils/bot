/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { CommandBase } from "@guild-utils/command-base";
import { CommandSchema } from "@guild-utils/command-schema";
import { Client } from "discord.js";
import { BasicBotConfigRepository } from "domain_guild-configs";
import {
  buildParser,
  CommandFromSchemaCtx,
  commandsToMapWithName,
  commandsToMapWithNameAndAlias,
  configurateCategory,
  configureCategoryValue,
  createCommandCollectionWithAlias,
  infoCategory,
  infoCategoryValue,
  initCoreCommands,
  CoreCommandOptions,
  rootCategory,
  voiceCategory,
  voiceCategoryValue,
  commandTextSupplier,
  RateLimitLangJaJP,
  RateLimitEntrys,
  CommandResolver,
  initConfCommand,
  commandFromSchema,
  BotLogger,
  coreKeys,
  keyInfoMap,
  KeysDeepEntry,
  HelpEntry,
} from "presentation_core";
import {
  defineConfCommandSchema,
  defineCoreCommandSchema,
} from "protocol_command-schema-core-bootstrap";
import { createEmbedWithMetaData } from "protocol_util-djs";
import { DependencyContainer } from "tsyringe";
export function defineSchema(
  client: () => Client
): Record<string, CommandSchema> {
  return {
    ...defineCoreCommandSchema(client),
    ...defineConfCommandSchema(
      {
        guild: true,
        member: false,
        user: false,
      },
      client
    ),
  };
}
export function initCommand(
  injection: CoreCommandOptions & { botConfig: BasicBotConfigRepository }
): Record<string, CommandBase> {
  return {
    ...initCoreCommands(injection),
    ...initConfCommand(
      {
        guild: true,
        member: false,
        user: false,
      },
      {
        botConfig: injection.botConfig,
        usecase: injection.configurate,
        color: injection.color,
      }
    ),
  };
}
export function initCommandParser(
  container: DependencyContainer,
  schemas: CommandSchema[]
) {
  const parser = buildParser(schemas);
  container.register("CommandParser", {
    useValue: parser,
  });
  return parser;
}
export function initCommandResolver(
  container: DependencyContainer,
  collection: Map<
    string,
    [CommandBase, CommandSchema | undefined, RateLimitEntrys]
  >
): CommandResolver {
  const resolver = (k: string) => {
    const resolvers = [collection];
    for (const resolver of resolvers) {
      const cmdBase = resolver.get(k);
      if (cmdBase) {
        return cmdBase;
      }
    }
  };
  container.register("CommandResolver", {
    useValue: resolver,
  });
  return resolver;
}
export function initCommandSystem(
  container: DependencyContainer,
  injection: Omit<CoreCommandOptions, "flatten" | "rootCategory"> & {
    // eslint-disable-next-line @typescript-eslint/ban-types
    schema: Record<string, CommandSchema<[], {}>>;
    botConfig: BasicBotConfigRepository;
  },
  ctx: CommandFromSchemaCtx
) {
  const infoValue = infoCategoryValue(injection.schema, ctx);
  const infoCat = infoCategory(
    ctx.color,
    commandsToMapWithNameAndAlias(infoValue),
    ...commandsToMapWithName(infoValue)
  );
  const coreKeysRes = keyInfoMap(coreKeys(ctx.color, ctx.defaultPrefix));
  const keysDeepEntry = new KeysDeepEntry(
    coreKeysRes[0],
    coreKeysRes[1],
    () => (cctx) =>
      createEmbedWithMetaData({
        color: ctx.color,
        ...cctx.executor,
      })
        .setTitle("keys")
        .setDescription("設定コマンドで用いるキーについてのドキュメントです。"),
    ctx.defaultPrefix
  );
  const configurateValue = [
    ...configureCategoryValue(injection.schema, ctx),
    commandFromSchema(injection.schema.conf, "Configurate", ctx),
  ];
  const configurateCategoryArgs: [
    Map<string, HelpEntry>,
    Map<string, HelpEntry>,
    Map<string, HelpEntry>
  ] = [
    commandsToMapWithNameAndAlias(configurateValue),
    ...commandsToMapWithName(configurateValue),
  ];
  configurateCategoryArgs.forEach((e) => e.set("keys", keysDeepEntry));
  const confCat = configurateCategory(ctx.color, ...configurateCategoryArgs);
  const voiceValue = voiceCategoryValue(injection.schema, ctx);
  const voiceCat = voiceCategory(
    ctx.color,
    commandsToMapWithNameAndAlias(voiceValue),
    ...commandsToMapWithName(voiceValue)
  );
  const rootValue = new Map([
    ["botinfo", infoCat],
    ["configurate", confCat],
    ["voice", voiceCat],
  ]);
  const helpReolverCommands = commandsToMapWithNameAndAlias([
    ...infoValue,
    ...configurateValue,
    ...voiceValue,
  ]);
  helpReolverCommands.set("keys", keysDeepEntry);
  const flatten = new Map([...helpReolverCommands, ...rootValue]);
  const command = initCommand(
    Object.assign({}, injection, {
      flatten,
      rootCategory: rootCategory(ctx.color, rootValue, rootValue),
    })
  );
  const collection = createCommandCollectionWithAlias(
    command,
    injection.schema,
    commandTextSupplier({
      ja_JP: RateLimitLangJaJP(ctx.color),
    })
  );
  BotLogger.info(collection.size, `Command Collection Size`);
  const parser = initCommandParser(container, Object.values(injection.schema));
  const resolver = initCommandResolver(container, collection);
  return { parser, resolver };
}
