import {
  ConfigurateUsecase,
  InvalidKeyError,
} from "protocol_configurate-usecase";

export default function (): ConfigurateUsecase["reset"] {
  return (t, k) => {
    throw new InvalidKeyError(k);
  };
}
