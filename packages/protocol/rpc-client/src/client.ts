import { IConfigManagerClient } from "protocol_protos/config_grpc_pb";
import { VoiceConfigRequest, ReadNameRequest } from "protocol_protos/config_pb";
import * as Domain from "domain_voice-configs";
import { ClientResponseTransformer } from ".";
export class Usecase implements Domain.Usecase {
  constructor(
    private readonly client: IConfigManagerClient,
    private readonly trans: ClientResponseTransformer
  ) {}
  async getUserReadNameResolvedBy(
    guild: string,
    user: string,
    nickname: string | undefined,
    username: string
  ): Promise<[string, string]> {
    const e = await this.getUserReadName(guild, user, nickname, username);
    return [e, "mainbot"];
  }
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
  appliedVoiceConfigResolvedBy(
    guild: string,
    user: string,
    nickname: string | undefined,
    username: string
  ): Promise<Domain.AppliedVoiceConfigResolvedBy> {
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
        resolve(this.trans.transformAppliedVoiceConfigResolvedBy(res));
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
