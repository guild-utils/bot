import {
  Service as GRPCService,
  ServerResponseTransformer,
  ConfigManagerService,
} from "presentation_rpc-server";
import { Server, ServerCredentials } from "grpc";
import Usecase from "presentation_configs-klasa";

export class GRPCServer {
  constructor(private readonly service: GRPCService) {}
  run(): void {
    const grpcServer: Server = new Server();
    grpcServer.addService(ConfigManagerService, {
      appliedVoiceConfig: this.service.appliedVoiceConfig.bind(this.service),
      readName: this.service.readName.bind(this.service),
    });

    grpcServer.bind("0.0.0.0:50051", ServerCredentials.createInsecure());
    grpcServer.start();
  }
}
export default function (configRepo: Usecase): void {
  const trans = new ServerResponseTransformer();
  const grpcService: GRPCService = new GRPCService(configRepo, trans);
  const grpc = new GRPCServer(grpcService);
  grpc.run();
}
