import {
  ConfigurateUsecase,
  ConfigurateUsecaseResultType,
  ExecutorType,
  TargetType,
} from "protocol_configurate-usecase";
type SetActionType = (
  t: TargetType,
  k: string,
  v: undefined,
  ctx: ExecutorType
) => Promise<ConfigurateUsecaseResultType>;
export default function (f: SetActionType): ConfigurateUsecase["reset"] {
  return (t, k, exec) => f(t, k, undefined, exec);
}
