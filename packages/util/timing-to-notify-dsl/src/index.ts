import * as moment from "moment-timezone";

export class TimingToNotifyDSLParser {
  // eslint-disable-next-line @typescript-eslint/require-await
  async parse(src: string): Promise<moment.Duration[]> {
    return src
      .replace(" ", "")
      .split(",")
      .map((e) => moment.duration(e));
  }
}
