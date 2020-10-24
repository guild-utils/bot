declare module "mongo-dot-notation" {
  function flatten(src: Record<string, unknown>): Record<string, unknown>;
  function isOperator(v: unknown): boolean;
  function $set(v: unknown): unknown;
  function $inc(v?: number): unknown;
  function $mul(v?: number): unknown;
  function $max(v: number): unknown;
  function $min(v: number): unknown;
}
