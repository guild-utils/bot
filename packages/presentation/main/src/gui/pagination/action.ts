export type SimpleActionType =
  | "Next"
  | "Prev"
  | "Head"
  | "Last"
  | "Help"
  | "Exit";
export interface SimpleAction {
  type: SimpleActionType;
}
export interface PageAction {
  type: "Page";
  index: number;
}
export type Action = SimpleAction | PageAction;
function router(content: string) {
  return (arr: string[]) => arr.some((e) => content.startsWith(e));
}
function simpleActionType(content: string): SimpleActionType | undefined {
  const route = router(content);
  if (route(["f", "first", "head", "<<", "\u23ea"])) {
    return "Head";
  }
  if (route(["l", "last", ">>", "\u23e9"])) {
    return "Last";
  }
  if (route(["n", "next", ">", "\u25b6", "\u27a1"])) {
    return "Next";
  }
  if (route(["b", "p", "back", "prev", "<", "\u25c0", "\u2b05"])) {
    return "Prev";
  }
  if (route(["help", "h", "?", "\u2139", "\u2753", "\u2754"])) {
    return "Help";
  }
  if (
    route([
      "q",
      "end",
      "halt",
      "quit",
      "exit",
      "close",
      "stop",
      "\u23f9",
      "\u274c",
    ])
  ) {
    return "Exit";
  }
}
function pageAction(content: string): PageAction | undefined {
  function filterInt(value: string) {
    if (/^[-+]?(\d+|Infinity)$/.test(value)) {
      return Number(value);
    } else {
      return NaN;
    }
  }
  const no = filterInt(content);
  if (Number.isSafeInteger(no)) {
    return { index: no - 1, type: "Page" };
  }
}
export function action(content: string): Action | undefined {
  const sat = simpleActionType(content);
  if (sat != undefined) {
    return { type: sat };
  }
  return pageAction(content);
}
