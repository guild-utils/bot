// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var config_pb = require('./config_pb.js');

function serialize_AppliedVoiceConfig(arg) {
  if (!(arg instanceof config_pb.AppliedVoiceConfig)) {
    throw new Error('Expected argument of type AppliedVoiceConfig');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_AppliedVoiceConfig(buffer_arg) {
  return config_pb.AppliedVoiceConfig.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_ReadName(arg) {
  if (!(arg instanceof config_pb.ReadName)) {
    throw new Error('Expected argument of type ReadName');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_ReadName(buffer_arg) {
  return config_pb.ReadName.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_ReadNameRequest(arg) {
  if (!(arg instanceof config_pb.ReadNameRequest)) {
    throw new Error('Expected argument of type ReadNameRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_ReadNameRequest(buffer_arg) {
  return config_pb.ReadNameRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_VoiceConfigRequest(arg) {
  if (!(arg instanceof config_pb.VoiceConfigRequest)) {
    throw new Error('Expected argument of type VoiceConfigRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_VoiceConfigRequest(buffer_arg) {
  return config_pb.VoiceConfigRequest.deserializeBinary(new Uint8Array(buffer_arg));
}


var ConfigManagerService = exports.ConfigManagerService = {
  appliedVoiceConfig: {
    path: '/ConfigManager/appliedVoiceConfig',
    requestStream: false,
    responseStream: false,
    requestType: config_pb.VoiceConfigRequest,
    responseType: config_pb.AppliedVoiceConfig,
    requestSerialize: serialize_VoiceConfigRequest,
    requestDeserialize: deserialize_VoiceConfigRequest,
    responseSerialize: serialize_AppliedVoiceConfig,
    responseDeserialize: deserialize_AppliedVoiceConfig,
  },
  readName: {
    path: '/ConfigManager/readName',
    requestStream: false,
    responseStream: false,
    requestType: config_pb.ReadNameRequest,
    responseType: config_pb.ReadName,
    requestSerialize: serialize_ReadNameRequest,
    requestDeserialize: deserialize_ReadNameRequest,
    responseSerialize: serialize_ReadName,
    responseDeserialize: deserialize_ReadName,
  },
};

exports.ConfigManagerClient = grpc.makeGenericClientConstructor(ConfigManagerService);
