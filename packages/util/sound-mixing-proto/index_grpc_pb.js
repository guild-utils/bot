// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var index_pb = require('./index_pb.js');

function serialize_ChunkedData(arg) {
  if (!(arg instanceof index_pb.ChunkedData)) {
    throw new Error('Expected argument of type ChunkedData');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_ChunkedData(buffer_arg) {
  return index_pb.ChunkedData.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_RequestVoiceMixing(arg) {
  if (!(arg instanceof index_pb.RequestVoiceMixing)) {
    throw new Error('Expected argument of type RequestVoiceMixing');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_RequestVoiceMixing(buffer_arg) {
  return index_pb.RequestVoiceMixing.deserializeBinary(new Uint8Array(buffer_arg));
}


var MixerService = exports.MixerService = {
  mixing: {
    path: '/Mixer/mixing',
    requestStream: false,
    responseStream: true,
    requestType: index_pb.RequestVoiceMixing,
    responseType: index_pb.ChunkedData,
    requestSerialize: serialize_RequestVoiceMixing,
    requestDeserialize: deserialize_RequestVoiceMixing,
    responseSerialize: serialize_ChunkedData,
    responseDeserialize: deserialize_ChunkedData,
  },
};

exports.MixerClient = grpc.makeGenericClientConstructor(MixerService);
