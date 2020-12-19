export interface PageInfoNormal {
  type: "normal";
  index: number;
}
export interface PageInfoHelp {
  type: "help";
  hidden: PageInfoNormal;
}
export interface StateExit {
  type: "exit";
}
export type PageInfo = PageInfoNormal | PageInfoHelp;
export type State = PageInfo | StateExit;
