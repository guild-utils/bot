// package: 
// file: index.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class RequestVoiceMixing extends jspb.Message { 
    getHtsvoice(): string;
    setHtsvoice(value: string): RequestVoiceMixing;

    getText(): string;
    setText(value: string): RequestVoiceMixing;

    getSpeed(): number;
    setSpeed(value: number): RequestVoiceMixing;

    getTone(): number;
    setTone(value: number): RequestVoiceMixing;

    getVolume(): number;
    setVolume(value: number): RequestVoiceMixing;

    getMaxreadlimit(): number;
    setMaxreadlimit(value: number): RequestVoiceMixing;

    getAllpass(): number;
    setAllpass(value: number): RequestVoiceMixing;

    getIntone(): number;
    setIntone(value: number): RequestVoiceMixing;

    getThreshold(): number;
    setThreshold(value: number): RequestVoiceMixing;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RequestVoiceMixing.AsObject;
    static toObject(includeInstance: boolean, msg: RequestVoiceMixing): RequestVoiceMixing.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RequestVoiceMixing, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RequestVoiceMixing;
    static deserializeBinaryFromReader(message: RequestVoiceMixing, reader: jspb.BinaryReader): RequestVoiceMixing;
}

export namespace RequestVoiceMixing {
    export type AsObject = {
        htsvoice: string,
        text: string,
        speed: number,
        tone: number,
        volume: number,
        maxreadlimit: number,
        allpass: number,
        intone: number,
        threshold: number,
    }
}

export class ChunkedData extends jspb.Message { 
    getData(): Uint8Array | string;
    getData_asU8(): Uint8Array;
    getData_asB64(): string;
    setData(value: Uint8Array | string): ChunkedData;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ChunkedData.AsObject;
    static toObject(includeInstance: boolean, msg: ChunkedData): ChunkedData.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ChunkedData, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ChunkedData;
    static deserializeBinaryFromReader(message: ChunkedData, reader: jspb.BinaryReader): ChunkedData;
}

export namespace ChunkedData {
    export type AsObject = {
        data: Uint8Array | string,
    }
}
