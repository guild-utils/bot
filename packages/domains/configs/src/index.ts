export type DictionaryEntryA = {
  to: string;
  p?: string;
  p1?: string;
  p2?: string;
  p3?: string;
};
export type DictionaryEntryB = {
  from: string;
  to: string;
};
export type Dictionary = {
  before: DictionaryEntryB[];
  entrys: Map<string, DictionaryEntryA>;
  after: DictionaryEntryB[];
};

export type AppliedVoiceConfig={
  dictionary:Dictionary
  kind:string;
  readName?:string;
  speed:number;
  tone:number;
  volume:number;
  maxReadLimit:number;
  allpass:number|undefined;
  intone:number;
  threshold:number;
}
export interface Usecase {
  appliedVoiceConfig(guild:string,user:string,nickname:string|undefined,username:string):Promise<AppliedVoiceConfig>;
  getUserReadName(guild:string,user:string,nickname:string|undefined,username:string):Promise<string>;
}
