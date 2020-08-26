import { Event, EventStore } from "klasa";
export default class extends Event {
  constructor(store: EventStore, file: string[], directory: string) {
    super(store, file, directory, {
      once: true,
      event: "klasaReady",
    });
  }
  run(): Promise<void> {
    console.log(
      [
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        `Logged in as: ${this.client.user!.tag}`,
        `Invite Link: ${this.client.invite}`,
      ].join("\n")
    );
    return Promise.resolve();
  }
}
