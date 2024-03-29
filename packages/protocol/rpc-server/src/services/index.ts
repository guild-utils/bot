import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import {
  VoiceConfigRequest,
  AppliedVoiceConfig,
  ReadNameRequest,
  ReadName,
} from "protocol_protos/config_pb";
import { Usecase } from "domain_voice-configs";
import { ResponseTransformer } from "../transformers/grpc-domain-server";

export class Service {
  constructor(
    private readonly repo: Usecase,
    private readonly trans: ResponseTransformer
  ) {}
  async appliedVoiceConfig(
    call: ServerUnaryCall<VoiceConfigRequest, AppliedVoiceConfig>,
    callback: sendUnaryData<AppliedVoiceConfig>
  ): Promise<void> {
    try {
      const request: VoiceConfigRequest = call.request;
      const guild = request.getGuild();
      const user = request.getUser();
      const nick = request.getNickname();
      const username = request.getUsername();
      const r = await this.repo.appliedVoiceConfig(
        guild,
        user,
        nick === "" ? undefined : nick,
        username
      );
      callback(null, this.trans.transformAppliedVoiceConfig(r));
    } catch (e) {
      console.error(e);
      callback(e, null);
    }
  }
  async readName(
    call: ServerUnaryCall<ReadNameRequest, ReadName>,
    callback: sendUnaryData<ReadName>
  ): Promise<void> {
    try {
      const request: ReadNameRequest = call.request;
      const guild = request.getGuild();
      const user = request.getUser();
      const nickRaw = request.getNickname();
      const nick = nickRaw === "" ? undefined : nickRaw;
      const username = request.getUsername();
      const res = await this.repo.getUserReadName(guild, user, nick, username);
      const r = new ReadName();
      r.setValue(res);
      callback(null, r);
    } catch (e) {
      console.error(e);
      callback(e, null);
    }
  }
}
