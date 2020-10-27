/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { CommandSchema } from "@guild-utils/command-schema";
import { AT_Member } from "@guild-utils/command-types-discord.js";
import type { Client } from "discord.js";
import { Context, DescriptionData } from "./common";
import { computeLanguage, createSimpleCommand, runInServer } from "./util";
const runIn = runInServer;
export function commandAppliedVoiceConfig(
  f: (
    lang: string,
    ctx: Context
  ) => Record<"command" | "member", DescriptionData>,
  client: () => Client
) {
  return new CommandSchema("applied-voice-config", {
    descriptionResolver: computeLanguage(f, "command"),
    alias: ["avc"],
    runIn,
  }).positional("member", new AT_Member(client), {
    descriptionResolver: computeLanguage(f, "member"),
    optional: true,
  });
}
export const commandEndChannel = createSimpleCommand("end-channel", {
  alias: ["ec"],
  runIn,
});
export const commandEnd = createSimpleCommand("end", {
  alias: ["e", "bye"],
  runIn,
});
export const commandSkip = createSimpleCommand("skip", {
  runIn,
  alias: ["stop"],
});
export const commandStart = createSimpleCommand("start", {
  alias: ["s", "summon"],
  runIn,
});
