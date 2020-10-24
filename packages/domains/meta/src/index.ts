export interface UpdateResultOk<T, U = T> {
  type: "ok";
  before: T;
  after: U;
}
export interface UpdateResultFail<T, U = T> {
  type: "same" | "error" | "not matched";
  before?: T;
  after?: U;
}

export type UpdateResult<T, U = T> =
  | UpdateResultOk<T, U>
  | UpdateResultFail<T, U>;
export const VoiceKind = {
  normal: "normal",
  angry: "angry",
  happy: "happy",
  neutral: "neutral",
  sad: "sad",
  mei_angry: "mei_angry",
  mei_bashful: "mei_bashful",
  mei_happy: "mei_happy",
  mei_normal: "mei_normal",
  mei_sad: "mei_sad",
  takumi_angry: "takumi_angry",
  takumi_happy: "takumi_happy",
  takumi_normal: "takumi_normal",
  takumi_sad: "takumi_sad",
  alpha: "alpha",
  beta: "beta",
  gamma: "gamma",
  delta: "delta",
};
export type VoiceKindType = keyof typeof VoiceKind;
export const VoiceKindArray = [...Object.keys(VoiceKind)] as VoiceKindType[];
