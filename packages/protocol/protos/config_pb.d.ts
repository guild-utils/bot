// package: 
// file: config.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class DictionaryEntryA extends jspb.Message { 
    getFrom(): string;
    setFrom(value: string): DictionaryEntryA;

    getTo(): string;
    setTo(value: string): DictionaryEntryA;

    getP(): string;
    setP(value: string): DictionaryEntryA;

    getP1(): string;
    setP1(value: string): DictionaryEntryA;

    getP2(): string;
    setP2(value: string): DictionaryEntryA;

    getP3(): string;
    setP3(value: string): DictionaryEntryA;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DictionaryEntryA.AsObject;
    static toObject(includeInstance: boolean, msg: DictionaryEntryA): DictionaryEntryA.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DictionaryEntryA, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DictionaryEntryA;
    static deserializeBinaryFromReader(message: DictionaryEntryA, reader: jspb.BinaryReader): DictionaryEntryA;
}

export namespace DictionaryEntryA {
    export type AsObject = {
        from: string,
        to: string,
        p: string,
        p1: string,
        p2: string,
        p3: string,
    }
}

export class DictionaryEntryB extends jspb.Message { 
    getFrom(): string;
    setFrom(value: string): DictionaryEntryB;

    getTo(): string;
    setTo(value: string): DictionaryEntryB;

    getIndex(): number;
    setIndex(value: number): DictionaryEntryB;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DictionaryEntryB.AsObject;
    static toObject(includeInstance: boolean, msg: DictionaryEntryB): DictionaryEntryB.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DictionaryEntryB, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DictionaryEntryB;
    static deserializeBinaryFromReader(message: DictionaryEntryB, reader: jspb.BinaryReader): DictionaryEntryB;
}

export namespace DictionaryEntryB {
    export type AsObject = {
        from: string,
        to: string,
        index: number,
    }
}

export class Dictionary extends jspb.Message { 
    clearBeforeList(): void;
    getBeforeList(): Array<DictionaryEntryB>;
    setBeforeList(value: Array<DictionaryEntryB>): Dictionary;
    addBefore(value?: DictionaryEntryB, index?: number): DictionaryEntryB;

    clearEntrysList(): void;
    getEntrysList(): Array<DictionaryEntryA>;
    setEntrysList(value: Array<DictionaryEntryA>): Dictionary;
    addEntrys(value?: DictionaryEntryA, index?: number): DictionaryEntryA;

    clearAfterList(): void;
    getAfterList(): Array<DictionaryEntryB>;
    setAfterList(value: Array<DictionaryEntryB>): Dictionary;
    addAfter(value?: DictionaryEntryB, index?: number): DictionaryEntryB;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Dictionary.AsObject;
    static toObject(includeInstance: boolean, msg: Dictionary): Dictionary.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Dictionary, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Dictionary;
    static deserializeBinaryFromReader(message: Dictionary, reader: jspb.BinaryReader): Dictionary;
}

export namespace Dictionary {
    export type AsObject = {
        beforeList: Array<DictionaryEntryB.AsObject>,
        entrysList: Array<DictionaryEntryA.AsObject>,
        afterList: Array<DictionaryEntryB.AsObject>,
    }
}

export class AppliedVoiceConfig extends jspb.Message { 
    getKind(): string;
    setKind(value: string): AppliedVoiceConfig;

    getReadname(): string;
    setReadname(value: string): AppliedVoiceConfig;

    getSpeed(): number;
    setSpeed(value: number): AppliedVoiceConfig;

    getTone(): number;
    setTone(value: number): AppliedVoiceConfig;

    getVolume(): number;
    setVolume(value: number): AppliedVoiceConfig;

    getMaxreadlimit(): number;
    setMaxreadlimit(value: number): AppliedVoiceConfig;

    getAllpass(): number;
    setAllpass(value: number): AppliedVoiceConfig;

    getIntone(): number;
    setIntone(value: number): AppliedVoiceConfig;

    getThreshold(): number;
    setThreshold(value: number): AppliedVoiceConfig;


    hasDictionary(): boolean;
    clearDictionary(): void;
    getDictionary(): Dictionary | undefined;
    setDictionary(value?: Dictionary): AppliedVoiceConfig;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AppliedVoiceConfig.AsObject;
    static toObject(includeInstance: boolean, msg: AppliedVoiceConfig): AppliedVoiceConfig.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: AppliedVoiceConfig, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AppliedVoiceConfig;
    static deserializeBinaryFromReader(message: AppliedVoiceConfig, reader: jspb.BinaryReader): AppliedVoiceConfig;
}

export namespace AppliedVoiceConfig {
    export type AsObject = {
        kind: string,
        readname: string,
        speed: number,
        tone: number,
        volume: number,
        maxreadlimit: number,
        allpass: number,
        intone: number,
        threshold: number,
        dictionary?: Dictionary.AsObject,
    }
}

export class VoiceConfigRequest extends jspb.Message { 
    getGuild(): string;
    setGuild(value: string): VoiceConfigRequest;

    getUser(): string;
    setUser(value: string): VoiceConfigRequest;

    getNickname(): string;
    setNickname(value: string): VoiceConfigRequest;

    getUsername(): string;
    setUsername(value: string): VoiceConfigRequest;

    getDictHash(): number;
    setDictHash(value: number): VoiceConfigRequest;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): VoiceConfigRequest.AsObject;
    static toObject(includeInstance: boolean, msg: VoiceConfigRequest): VoiceConfigRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: VoiceConfigRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): VoiceConfigRequest;
    static deserializeBinaryFromReader(message: VoiceConfigRequest, reader: jspb.BinaryReader): VoiceConfigRequest;
}

export namespace VoiceConfigRequest {
    export type AsObject = {
        guild: string,
        user: string,
        nickname: string,
        username: string,
        dictHash: number,
    }
}

export class ReadNameRequest extends jspb.Message { 
    getGuild(): string;
    setGuild(value: string): ReadNameRequest;

    getUser(): string;
    setUser(value: string): ReadNameRequest;

    getNickname(): string;
    setNickname(value: string): ReadNameRequest;

    getUsername(): string;
    setUsername(value: string): ReadNameRequest;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ReadNameRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ReadNameRequest): ReadNameRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ReadNameRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ReadNameRequest;
    static deserializeBinaryFromReader(message: ReadNameRequest, reader: jspb.BinaryReader): ReadNameRequest;
}

export namespace ReadNameRequest {
    export type AsObject = {
        guild: string,
        user: string,
        nickname: string,
        username: string,
    }
}

export class ReadName extends jspb.Message { 
    getValue(): string;
    setValue(value: string): ReadName;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ReadName.AsObject;
    static toObject(includeInstance: boolean, msg: ReadName): ReadName.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ReadName, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ReadName;
    static deserializeBinaryFromReader(message: ReadName, reader: jspb.BinaryReader): ReadName;
}

export namespace ReadName {
    export type AsObject = {
        value: string,
    }
}
