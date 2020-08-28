import * as GRPC from "protocol_protos/config_pb";
import * as Domain from "domain_configs";

export class ResponseTransformer {
  transformDictionary(from: GRPC.Dictionary): Domain.Dictionary {
    return {
      after: from
        .getAfterList()
        .sort((a, b) => a.getIndex() - b.getIndex())
        .map((e) => {
          return { from: e.getFrom(), to: e.getTo() };
        }),
      before: from
        .getBeforeList()
        .sort((a, b) => a.getIndex() - b.getIndex())
        .map((e) => {
          return { from: e.getFrom(), to: e.getTo() };
        }),
      main: new Map(
        from.getEntrysList().map((e) => [
          e.getFrom(),
          {
            to: e.getTo(),
            p: e.getP(),
            p1: e.getP1(),
            p2: e.getP2(),
            p3: e.getP3(),
          },
        ])
      ),
    };
  }
  transformAppliedVoiceConfig(
    from: GRPC.AppliedVoiceConfig
  ): Domain.AppliedVoiceConfig {
    const ap = from.getAllpass();
    const readName = from.getReadname();

    return {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      dictionary: this.transformDictionary(from.getDictionary()!),
      kind: from.getKind(),
      readName: readName === "" ? undefined : readName,
      speed: from.getSpeed(),
      tone: from.getTone(),
      volume: from.getVolume(),
      maxReadLimit: from.getMaxreadlimit(),
      allpass: ap === -1 ? undefined : ap,
      intone: from.getIntone(),
      threshold: from.getThreshold(),
    };
  }
  transformAppliedVoiceConfigResolvedBy(
    from: GRPC.AppliedVoiceConfig
  ): Domain.AppliedVoiceConfigResolvedBy {
    const provider = "mainbot";
    const ap = from.getAllpass();
    const readName = from.getReadname();
    return {
      dictionary: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        value: this.transformDictionary(from.getDictionary()!),
        provider,
      },
      kind: {
        value: from.getKind(),
        provider,
      },
      readName: {
        value: readName === "" ? undefined : readName,
        provider,
      },
      speed: {
        value: from.getSpeed(),
        provider,
      },
      tone: {
        value: from.getTone(),
        provider,
      },
      volume: {
        value: from.getVolume(),
        provider,
      },
      maxReadLimit: {
        value: from.getMaxreadlimit(),
        provider,
      },
      allpass: {
        value: ap === -1 ? undefined : ap,
        provider,
      },
      intone: {
        value: from.getIntone(),
        provider,
      },
      threshold: {
        value: from.getThreshold(),
        provider,
      },
    };
  }
}
