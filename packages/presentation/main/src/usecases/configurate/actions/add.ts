import {
  ConfigurateUsecase,
  InvalidKeyError,
} from "protocol_configurate-usecase";

export default function (): ConfigurateUsecase["add"] {
  return (t, k) => {
    throw new InvalidKeyError(k);
  };
}
