// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
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
};

exports.ConfigManagerClient = grpc.makeGenericClientConstructor(ConfigManagerService);
