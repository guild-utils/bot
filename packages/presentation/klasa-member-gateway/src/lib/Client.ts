/* eslint-disable */

import { KlasaClient, Schema, util } from "klasa";
const { mergeDefault } = util;
import { CLIENT } from "./util/constants";
import MemberGateway from "./settings/MemberGateway";

(KlasaClient as any).defaultMemberSchema = new Schema();
export default class extends KlasaClient {
  constructor(options) {
    super(options);
    this.constructor[KlasaClient.plugin].call(this);
  }

  static [KlasaClient.plugin]() {
    const self: any = this;
    mergeDefault(CLIENT, self.options);
    const { members } = self.options.gateways;
    if (!members) {
      throw new Error("klasa-member-gateway initialized error");
    }
    const memberSchema =
      "schema" in members
        ? members.schema
        : (this.constructor as any).defaultMemberSchema;
    const provider = members.provider || self.options.providers.default;
    if (!provider) {
      throw new Error("klasa-member-gateway initialized error");
    }
    self.gateways.members = new MemberGateway(
      self.gateways,
      "members",
      memberSchema,
      provider
    );
    self.gateways.keys.add("members");
    self.gateways._queue.push(
      self.gateways.members.init.bind(self.gateways.members)
    );
  }
}
