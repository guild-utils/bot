// package: 
// file: index.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "grpc";
import * as index_pb from "./index_pb";

interface IMixerService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    mixing: IMixerService_Imixing;
}

interface IMixerService_Imixing extends grpc.MethodDefinition<index_pb.RequestVoiceMixing, index_pb.ChunkedData> {
    path: string; // "/.Mixer/mixing"
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<index_pb.RequestVoiceMixing>;
    requestDeserialize: grpc.deserialize<index_pb.RequestVoiceMixing>;
    responseSerialize: grpc.serialize<index_pb.ChunkedData>;
    responseDeserialize: grpc.deserialize<index_pb.ChunkedData>;
}

export const MixerService: IMixerService;

export interface IMixerServer {
    mixing: grpc.handleServerStreamingCall<index_pb.RequestVoiceMixing, index_pb.ChunkedData>;
}

export interface IMixerClient {
    mixing(request: index_pb.RequestVoiceMixing, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<index_pb.ChunkedData>;
    mixing(request: index_pb.RequestVoiceMixing, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<index_pb.ChunkedData>;
}

export class MixerClient extends grpc.Client implements IMixerClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public mixing(request: index_pb.RequestVoiceMixing, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<index_pb.ChunkedData>;
    public mixing(request: index_pb.RequestVoiceMixing, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<index_pb.ChunkedData>;
}
