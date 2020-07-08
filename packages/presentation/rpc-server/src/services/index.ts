import { ServerUnaryCall } from "grpc";
import { VoiceConfigRequest, AppliedVoiceConfig } from "../../protos/config_pb";
import { Repository } from "../repository";
import { ResponseTransformer } from "../transformers/grpc-domain-server";
export class Service {
  constructor(
    private readonly repo: Repository,
    private readonly trans: ResponseTransformer
  ) {}
  async appliedVoiceConfig(
    call: ServerUnaryCall<VoiceConfigRequest>,
    callback: (x: null | { error: any }, ret?: AppliedVoiceConfig) => void
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
      callback({ error: String(e) });
    }
  }
}
