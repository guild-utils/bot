import {
  GuiEventMap,
  GuiBase,
  createContexts,
  mixinAll,
  initializeGui,
  serealAddReaction,
} from "./gui";
import {
  MessageEmbed,
  ColorResolvable,
  GuildMember,
  Message,
  TextChannel,
  Permissions,
} from "discord.js";
import { getLangType } from "presentation_core";
export type CtxBase<Page> = {
  pages: Page[][];
  help: boolean;
  currentPage: number;
  member: GuildMember;
  authorId: string;
  timestamp: number;
  abortController?: AbortController;
};
type PaginationEventMap<Ctx> = GuiEventMap<Ctx> & {
  RemoveReaction: { target: Message; abortController?: AbortController };
  Init: {
    message: Message;
    context: Ctx;
  };
};
export type Options<Ctx> = {
  buildEmbed: (
    lang: string,
    no: number,
    context: Ctx,
    options: Options<Ctx>
  ) => MessageEmbed | undefined;
  help: (lang: string, context: Ctx, options: Options<Ctx>) => MessageEmbed;
  title: (lang: string) => string;
  color: ColorResolvable;
  timeoutMs: number;
  getLang: getLangType;
};
export type PaginationGui<Ctx> = GuiBase<PaginationEventMap<Ctx>, Ctx>;

export function createPagination<Ctx extends CtxBase<Page>, Page>(
  options: Options<Ctx>
): PaginationGui<Ctx> {
  const ctxs = createContexts<Ctx>();
  const PaginationGui = mixinAll<PaginationEventMap<Ctx>, Ctx>(ctxs);
  const list = new PaginationGui();
  initializeGui(list, { ...options, ctxs });
  list.use("Page", ({ no, target, context }) => {
    async function run() {
      context.help = false;
      const embed = options.buildEmbed(
        await options.getLang(context.member.guild.id),
        no,
        context,
        options
      );
      if (embed) {
        await target.edit(embed);
      }
    }
    run().catch(console.log);
  });
  list.use("Next", (ev, { emit }) => {
    emit("Page", { ...ev, no: ev.context.currentPage + 1 });
  });
  list.use("Prev", (ev, { emit }) => {
    emit("Page", { ...ev, no: ev.context.currentPage - 1 });
  });
  list.use("Head", (ev, { emit }) => {
    emit("Page", { ...ev, no: 0 });
  });
  list.use("Last", (ev, { emit }) => {
    emit("Page", { ...ev, no: ev.context.pages.length - 1 });
  });
  list.use("Exit", ({ target, context: { abortController } }, { emit }) => {
    list.unregister(target);
    emit("RemoveReaction", { target, abortController });
  });
  list.use("Help", ({ target, context }, { emit }) => {
    async function run() {
      context.help = !context.help;
      if (!context.help) {
        emit("Page", { target, context, no: context.currentPage });
        return;
      }
      await target.edit(
        options.help(
          await options.getLang(context.member.guild.id),
          context,
          options
        )
      );
    }
    run().catch(console.log);
  });
  list.use("Timeout", ({ target }, { emit }) => {
    const { abortController } = ctxs.contexts.contexts.get(target.id) ?? {};
    list.unregister(target);
    emit("RemoveReaction", { target, abortController });
  });
  list.use("RemoveReaction", ({ target, abortController }) => {
    abortController?.abort();
    const textChannel = target.channel as TextChannel;
    const me = textChannel.guild.me;
    if (!me) {
      return;
    }
    const permissions = textChannel.permissionsFor(me);
    if (!permissions) {
      return;
    }
    if (permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
      target.reactions.removeAll().catch(console.log);
    } else {
      Promise.all(target.reactions.cache.map((e) => e.users.remove(me))).catch(
        console.log
      );
    }
  });

  list.use("Init", ({ message, context }, { emit }) => {
    async function run() {
      const embed = options.buildEmbed(
        await options.getLang(context.member.guild.id),
        context.currentPage,
        context,
        options
      );
      if (!embed) {
        return;
      }
      const target = await message.channel.send(embed);
      list.register(target, context);
      const abortController = (context.abortController = new AbortController());
      await serealAddReaction(
        target,
        ["\u23ea", "\u25c0", "\u23f9", "\u25b6", "\u23e9", "\u2753"],
        abortController.signal
      );
      emit("Schedule", { target });
      context.abortController = undefined;
    }
    run().catch(console.log);
  });
  return list;
}
