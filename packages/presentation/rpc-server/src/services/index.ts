import { ServerUnaryCall, sendUnaryData, ServiceError } from "grpc";
import {
  VoiceConfigRequest,
  AppliedVoiceConfig,
  ReadNameRequest,
  ReadName,
} from "presentation_protos/config_pb";
import { Usecase } from "domain_configs";
import { ResponseTransformer } from "../transformers/grpc-domain-server";
export class ServiceErrorImpl extends Error implements ServiceError {}
export class Service {
  constructor(
    private readonly repo: Usecase,
    private readonly trans: ResponseTransformer
  ) {}
  async appliedVoiceConfig(
    call: ServerUnaryCall<VoiceConfigRequest>,
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
    call: ServerUnaryCall<ReadNameRequest>,
    callback: sendUnaryData<ReadName>
  ): Promise<void> {
    try {
      const request: ReadNameRequest = call.request;
      const guild = request.getGuild();
      const user = request.getUser();
      const nick = request.getNickname();
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
