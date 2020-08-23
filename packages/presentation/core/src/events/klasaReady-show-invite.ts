import { Event, EventStore } from "klasa";
export default class extends Event {
  constructor(store: EventStore, file: string[], directory: string) {
    super(store, file, directory, {
      once: true,
      event: "klasaReady",
    });
  }
  run(): Promise<void> {
    console.log(`Invite Link: ${this.client.invite}`);
    return Promise.resolve();
  }
}
