import { RateLimitEntry, RateLimitScope } from "@guild-utils/command-schema";
import { Message, MessageEmbed } from "discord.js";
import { RateLimit, ResetTime } from "rate-limit";
export type RateLimitLangDescription = (
  lang: string
) => (resetTime: ResetTime, msg: Message) => MessageEmbed;
export type RateLimitEntrys = [
  RateLimitScope,
  RateLimitLangDescription,
  RateLimit<unknown>
][];
export function createRateLimitEntrys(
  entrySet: Set<RateLimitEntry>,
  lang: (
    lang: string
  ) => (e: RateLimitEntry, rt: ResetTime, message: Message) => MessageEmbed
): RateLimitEntrys {
  const [a, l, b] = [...entrySet].map(
    ([t, cnt, interval]: [RateLimitScope, number, number]): [
      RateLimitScope,
      RateLimitLangDescription,
      RateLimit<unknown>
    ] => {
      return [
        t,
        (l: string) => (resetTime: ResetTime, message: Message) =>
          lang(l)([t, cnt, interval], resetTime, message),
        new RateLimit(
          (k, now: number): Promise<[number, number]> =>
            Promise.resolve([cnt, now + interval])
        ),
      ];
    }
  );
  return [a, l, b];
}
