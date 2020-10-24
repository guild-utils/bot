export type Context = {
  enviromnet: "web" | "discord";
  prefix?: string;
  defaultPrefix: string;
  runningCommand?: string[];
};
export function getPrefixWithContext(ctx: Context): string {
  return ctx.prefix ?? ctx.defaultPrefix;
}
export type DescriptionData = {
  description?: string;
  summary: string | undefined;
  undocumented?: boolean;
};
declare module "@guild-utils/command-schema" {
  interface OptionBase {
    descriptionResolver: (lang: string, ctx: Context) => DescriptionData;
  }
}
