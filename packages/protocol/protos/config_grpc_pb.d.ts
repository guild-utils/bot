// package: 
// file: config.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as config_pb from "./config_pb";

interface IConfigManagerService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    appliedVoiceConfig: IConfigManagerService_IappliedVoiceConfig;
    readName: IConfigManagerService_IreadName;
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
interface IConfigManagerService_IreadName extends grpc.MethodDefinition<config_pb.ReadNameRequest, config_pb.ReadName> {
    path: string; // "/.ConfigManager/readName"
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<config_pb.ReadNameRequest>;
    requestDeserialize: grpc.deserialize<config_pb.ReadNameRequest>;
    responseSerialize: grpc.serialize<config_pb.ReadName>;
    responseDeserialize: grpc.deserialize<config_pb.ReadName>;
}

export const ConfigManagerService: IConfigManagerService;

export interface IConfigManagerServer {
    appliedVoiceConfig: grpc.handleUnaryCall<config_pb.VoiceConfigRequest, config_pb.AppliedVoiceConfig>;
    readName: grpc.handleUnaryCall<config_pb.ReadNameRequest, config_pb.ReadName>;
}

export interface IConfigManagerClient {
    appliedVoiceConfig(request: config_pb.VoiceConfigRequest, callback: (error: grpc.ServiceError | null, response: config_pb.AppliedVoiceConfig) => void): grpc.ClientUnaryCall;
    appliedVoiceConfig(request: config_pb.VoiceConfigRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: config_pb.AppliedVoiceConfig) => void): grpc.ClientUnaryCall;
    appliedVoiceConfig(request: config_pb.VoiceConfigRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: config_pb.AppliedVoiceConfig) => void): grpc.ClientUnaryCall;
    readName(request: config_pb.ReadNameRequest, callback: (error: grpc.ServiceError | null, response: config_pb.ReadName) => void): grpc.ClientUnaryCall;
    readName(request: config_pb.ReadNameRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: config_pb.ReadName) => void): grpc.ClientUnaryCall;
    readName(request: config_pb.ReadNameRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: config_pb.ReadName) => void): grpc.ClientUnaryCall;
}

export class ConfigManagerClient extends grpc.Client implements IConfigManagerClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public appliedVoiceConfig(request: config_pb.VoiceConfigRequest, callback: (error: grpc.ServiceError | null, response: config_pb.AppliedVoiceConfig) => void): grpc.ClientUnaryCall;
    public appliedVoiceConfig(request: config_pb.VoiceConfigRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: config_pb.AppliedVoiceConfig) => void): grpc.ClientUnaryCall;
    public appliedVoiceConfig(request: config_pb.VoiceConfigRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: config_pb.AppliedVoiceConfig) => void): grpc.ClientUnaryCall;
    public readName(request: config_pb.ReadNameRequest, callback: (error: grpc.ServiceError | null, response: config_pb.ReadName) => void): grpc.ClientUnaryCall;
    public readName(request: config_pb.ReadNameRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: config_pb.ReadName) => void): grpc.ClientUnaryCall;
    public readName(request: config_pb.ReadNameRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: config_pb.ReadName) => void): grpc.ClientUnaryCall;
}
