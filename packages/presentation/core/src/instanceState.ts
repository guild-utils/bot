import { EventEmitter } from "events";

const StateRunning = "running";
const StateStarting = "starting";
const StateTerminating = "terminating";
type StateType =
  | typeof StateRunning
  | typeof StateStarting
  | typeof StateTerminating;
export class InstanceState extends EventEmitter {
  private state_: StateType = StateStarting;
  get state(): StateType {
    return this.state_;
  }
  setState(state: StateType): void {
    switch (state) {
      case StateStarting:
        throw new TypeError();
      case StateRunning:
        if (this.state_ === StateStarting) {
          this.state_ = state;
          this.emit(state);
        }
        break;
      case StateTerminating:
        this.state_ = state;
        this.emit(state);
    }
  }
}
