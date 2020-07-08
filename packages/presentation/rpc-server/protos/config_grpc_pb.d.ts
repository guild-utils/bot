// package: 
// file: config.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "grpc";
import * as config_pb from "./config_pb";

interface IConfigManagerService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    appliedVoiceConfig: IConfigManagerService_IappliedVoiceConfig;
}

interface IConfigManagerService_IappliedVoiceConfig extends grpc.MethodDefinition<config_pb.VoiceConfigRequest, config_pb.AppliedVoiceConfig> {
    path: string; // "/.ConfigManager/appliedVoiceConfig"
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<config_pb.VoiceConfigRequest>;
    requestDeserialize: grpc.deserialize<config_pb.VoiceConfigRequest>;
    responseSerialize: grpc.serialize<config_pb.AppliedVoiceConfig>;
    responseDeserialize: grpc.deserialize<config_pb.AppliedVoiceConfig>;
}

export const ConfigManagerService: IConfigManagerService;

export interface IConfigManagerServer {
    appliedVoiceConfig: grpc.handleUnaryCall<config_pb.VoiceConfigRequest, config_pb.AppliedVoiceConfig>;
}

export interface IConfigManagerClient {
    appliedVoiceConfig(request: config_pb.VoiceConfigRequest, callback: (error: grpc.ServiceError | null, response: config_pb.AppliedVoiceConfig) => void): grpc.ClientUnaryCall;
    appliedVoiceConfig(request: config_pb.VoiceConfigRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: config_pb.AppliedVoiceConfig) => void): grpc.ClientUnaryCall;
    appliedVoiceConfig(request: config_pb.VoiceConfigRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: config_pb.AppliedVoiceConfig) => void): grpc.ClientUnaryCall;
}

export class ConfigManagerClient extends grpc.Client implements IConfigManagerClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public appliedVoiceConfig(request: config_pb.VoiceConfigRequest, callback: (error: grpc.ServiceError | null, response: config_pb.AppliedVoiceConfig) => void): grpc.ClientUnaryCall;
    public appliedVoiceConfig(request: config_pb.VoiceConfigRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: config_pb.AppliedVoiceConfig) => void): grpc.ClientUnaryCall;
    public appliedVoiceConfig(request: config_pb.VoiceConfigRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: config_pb.AppliedVoiceConfig) => void): grpc.ClientUnaryCall;
}
