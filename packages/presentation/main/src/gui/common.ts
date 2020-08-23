/* eslint-disable @typescript-eslint/no-explicit-any */
import { GuiBase } from "discordjs-gui";
import { MessageMixin } from "discordjs-gui/mixins/message";
import { ReactionMixin } from "discordjs-gui/mixins/reaction";
import { Message } from "discord.js";

export interface Gui
  extends GuiBase<any>,
    MessageMixin<any>,
    ReactionMixin<any> {}
export interface GuiControllerMixin<Ctx> {
  register(message: Message, ctx: Ctx): void;
  unregister(message: Message): void;
}
