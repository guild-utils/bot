import { Service, ConfigManagerService } from "presentation_rpc-server";
import { Server, ServerCredentials } from "grpc";

export class GRPCServer {
  constructor(private readonly service: Service) {}
  run(): void {
    const grpcServer: Server = new Server();
    grpcServer.addService(ConfigManagerService, {
      appliedVoiceConfig: this.service.appliedVoiceConfig.bind(this.service),
    });

    grpcServer.bind("0.0.0.0:50051", ServerCredentials.createInsecure());
    grpcServer.start();
  }
}
