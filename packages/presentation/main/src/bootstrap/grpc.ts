import {
  Service as GRPCService,
  ServerResponseTransformer,
  ConfigManagerService,
} from "protocol_rpc-server";
import { Server, ServerCredentials } from "@grpc/grpc-js";
import { Usecase } from "protocol_configs-klasa";

export class GRPCServer {
  constructor(private readonly service: GRPCService) {}
  async run(): Promise<void> {
    const grpcServer: Server = new Server();
    grpcServer.addService(ConfigManagerService, {
      appliedVoiceConfig: this.service.appliedVoiceConfig.bind(this.service),
      readName: this.service.readName.bind(this.service),
    });

    await new Promise((resolve, reject) =>
      grpcServer.bindAsync(
        "0.0.0.0:50051",
        ServerCredentials.createInsecure(),
        (err, port) => {
          if (err) {
            reject(err);
          } else {
            resolve(port);
          }
        }
      )
    );
    grpcServer.start();
  }
}
export default async function (configRepo: Usecase): Promise<void> {
  const trans = new ServerResponseTransformer();
  const grpcService: GRPCService = new GRPCService(configRepo, trans);
  const grpc = new GRPCServer(grpcService);
  await grpc.run();
}
