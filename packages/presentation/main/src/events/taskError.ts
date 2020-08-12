/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Event } from "klasa";
import { Task } from "klasa";

export default class extends Event {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  run(_scheduledTask: any, task: Task, error: any): void {
    this.client.emit(
      "warn",
      `[TASK] ${task.path}\n${
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions,@typescript-eslint/no-unsafe-member-access
        error ? (error.stack ? error.stack : error) : "Unknown error"
      }`
    );
  }
}
