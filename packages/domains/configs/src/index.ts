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
}
export interface Repository {
  appliedVoiceConfig(guild:string,user:string,nickname:string|undefined,username:string):Promise<AppliedVoiceConfig>
}
