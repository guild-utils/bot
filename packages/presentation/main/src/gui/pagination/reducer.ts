import { Action } from "./action";
import { PageInfoNormal, State } from "./state";

export type Reducer<S, A> = (state: S, action: A) => S;
export function createReducer(
  minIndex: number,
  maxIndex: number
): Reducer<State, Action> {
  function range(index: number) {
    return Math.min(Math.max(minIndex, index), maxIndex - 1);
  }
  function normalState(index: number): PageInfoNormal {
    return {
      type: "normal",
      index: range(index),
    };
  }
  const reducer: Reducer<State, Action> = (state, action): State => {
    if (state.type === "exit") {
      return state;
    }
    const realState = state.type === "normal" ? state : state.hidden;

    switch (action.type) {
      case "Exit":
        return { type: "exit" };
      case "Head":
        return normalState(minIndex);
      case "Help":
        if (state.type === "help") {
          return state.hidden;
        }
        return {
          hidden: realState,
          type: "help",
        };
      case "Last":
        return normalState(maxIndex - 1);
      case "Next":
        return normalState(realState.index + 1);
      case "Prev":
        return normalState(realState.index - 1);
      case "Page":
        return normalState(action.index);
    }
  };
  return reducer;
}
