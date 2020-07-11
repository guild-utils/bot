import { IConfigManagerClient } from "presentation_protos/config_grpc_pb";
import {
  VoiceConfigRequest,
  ReadNameRequest,
} from "presentation_protos/config_pb";
import * as Domain from "domain_configs";
import { ClientResponseTransformer } from ".";
export class Usecase implements Domain.Usecase {
  constructor(
    private readonly client: IConfigManagerClient,
    private readonly trans: ClientResponseTransformer
  ) {}
  appliedVoiceConfig(
    guild: string,
    user: string,
    nickname: string | undefined,
    username: string
  ): Promise<Domain.AppliedVoiceConfig> {
    return new Promise((resolve, reject) => {
      const req = new VoiceConfigRequest();
      req.setGuild(guild);
      req.setUser(user);
      req.setNickname(nickname ?? "");
      req.setUsername(username);
      this.client.appliedVoiceConfig(req, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.trans.transformAppliedVoiceConfig(res));
      });
    });
  }
  getUserReadName(
    guild: string,
    user: string,
    nickname: string | undefined,
    username: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const req = new ReadNameRequest();
      req.setGuild(guild);
      req.setUser(user);
      req.setNickname(nickname ?? "");
      req.setUsername(username);
      this.client.readName(req, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res.getValue());
      });
    });
  }
}
