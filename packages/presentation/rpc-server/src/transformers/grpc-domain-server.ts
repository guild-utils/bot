import * as GRPC from "presentation_protos/config_pb";
import * as Domain from "domain_configs";

export class ResponseTransformer {
  transformDictionary(from: Domain.Dictionary): GRPC.Dictionary {
    const r = new GRPC.Dictionary();
    r.setAfterList(
      from.after.map((e, i) => {
        const a = new GRPC.DictionaryEntryB();
        a.setFrom(e.from);
        a.setTo(e.to);
        a.setIndex(i);
        return a;
      })
    );
    r.setBeforeList(
      from.after.map((e, i) => {
        const a = new GRPC.DictionaryEntryB();
        a.setFrom(e.from);
        a.setTo(e.to);
        a.setIndex(i);
        return a;
      })
    );
    r.setEntrysList(
      [...from.entrys].map(([k, v]) => {
        const a = new GRPC.DictionaryEntryA();
        a.setFrom(k);
        a.setTo(v.to);
        a.setP(v.p ?? "");
        a.setP1(v.p1 ?? "");
        a.setP2(v.p2 ?? "");
        a.setP3(v.p3 ?? "");
        return a;
      })
    );
    return r;
  }
  transformAppliedVoiceConfig(
    from: Domain.AppliedVoiceConfig
  ): GRPC.AppliedVoiceConfig {
    const r = new GRPC.AppliedVoiceConfig();
    r.setVolume(from.volume);
    r.setKind(from.kind);
    r.setReadname(from.readName ?? "");
    r.setSpeed(from.speed);
    r.setDictionary(this.transformDictionary(from.dictionary));
    r.setMaxreadlimit(from.maxReadLimit);
    r.setAllpass(from.allpass ?? -1);
    r.setIntone(from.intone);
    r.setThreshold(from.threshold);
    return r;
  }
}
