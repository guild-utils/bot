FROM alpine:3.12 AS build-jumanpp
RUN apk add --no-cache build-base cmake protobuf-dev protoc libexecinfo-dev

COPY packages/util/jumanpp-2.0.0-rc3 /usr/app/builder

WORKDIR /usr/app/builder

RUN find ./ -type f -print | xargs chmod 777 \
    &&mkdir build \
    &&cd build \
    &&cmake .. \
    -DCMAKE_BUILD_TYPE=Release \
    && make install -j

FROM node:14-alpine AS runtime

WORKDIR /usr/app
RUN apk add --no-cache --virtual .ojt git
RUN yarn global add pm2 lerna


ENV HTS_VOICE_NORMAL /usr/app/packages/util/open-jtalk/htsvoice/hts_voice_nitech_jp_atr503_m001-1.05/nitech_jp_atr503_m001.htsvoice
ENV HTS_VOICE_ANGRY /usr/app/packages/util/open-jtalk/htsvoice/htsvoice-tohoku-f01-master/tohoku-f01-angry.htsvoice
ENV HTS_VOICE_HAPPY /usr/app/packages/util/open-jtalk/htsvoice/htsvoice-tohoku-f01-master/tohoku-f01-happy.htsvoice
ENV HTS_VOICE_NEUTRAL /usr/app/packages/util/open-jtalk/htsvoice/htsvoice-tohoku-f01-master/tohoku-f01-neutral.htsvoice
ENV HTS_VOICE_SAD /usr/app/packages/util/open-jtalk/htsvoice/htsvoice-tohoku-f01-master/tohoku-f01-sad.htsvoice
ENV HTS_VOICE_MEI_ANGRY /usr/app/packages/util/open-jtalk/htsvoice/MMDAgent_Example-1.8/Voice/mei/mei_angry.htsvoice
ENV HTS_VOICE_MEI_BASHFUL /usr/app/packages/util/open-jtalk/htsvoice/MMDAgent_Example-1.8/Voice/mei/mei_bashful.htsvoice
ENV HTS_VOICE_MEI_HAPPY /usr/app/packages/util/open-jtalk/htsvoice/MMDAgent_Example-1.8/Voice/mei/mei_happy.htsvoice
ENV HTS_VOICE_MEI_NORMAL /usr/app/packages/util/open-jtalk/htsvoice/MMDAgent_Example-1.8/Voice/mei/mei_normal.htsvoice
ENV HTS_VOICE_MEI_SAD /usr/app/packages/util/open-jtalk/htsvoice/MMDAgent_Example-1.8/Voice/mei/mei_sad.htsvoice
ENV HTS_VOICE_TAKUMI_ANGRY /usr/app/packages/util/open-jtalk/htsvoice/MMDAgent_Example-1.8/Voice/takumi/takumi_angry.htsvoice
ENV HTS_VOICE_TAKUMI_HAPPY /usr/app/packages/util/open-jtalk/htsvoice/MMDAgent_Example-1.8/Voice/takumi/takumi_happy.htsvoice
ENV HTS_VOICE_TAKUMI_NORMAL /usr/app/packages/util/open-jtalk/htsvoice/MMDAgent_Example-1.8/Voice/takumi/takumi_normal.htsvoice
ENV HTS_VOICE_TAKUMI_SAD /usr/app/packages/util/open-jtalk/htsvoice/MMDAgent_Example-1.8/Voice/takumi/takumi_sad.htsvoice
ENV HTS_VOICE_ALPHA /usr/app/packages/util/open-jtalk/htsvoice/VoiceAlpha.htsvoice
ENV HTS_VOICE_BETA /usr/app/packages/util/open-jtalk/htsvoice/VoiceBeta.htsvoice
ENV HTS_VOICE_GAMMA /usr/app/packages/util/open-jtalk/htsvoice/VoiceGamma.htsvoice
ENV HTS_VOICE_DELTA /usr/app/packages/util/open-jtalk/htsvoice/VoiceDelta.htsvoice

ENV KUROMOJI_DIC_PATH /usr/app/packages/util/kuromoji-js/dict
ENV JUMANPP_PATH /usr/local/bin/jumanpp

COPY --from=build-jumanpp /usr/local/bin/jumanpp /usr/local/bin/jumanpp
COPY --from=build-jumanpp /usr/local/libexec/jumanpp /usr/local/libexec/jumanpp
COPY packages/util/open-jtalk/htsvoice ./packages/util/open-jtalk/htsvoice
COPY packages/util/kuromoji-js/dict /usr/app/packages/util/kuromoji-js/dict
COPY lerna.json ./
COPY tsconfig.json ./
COPY package.json ./
COPY yarn.lock ./

COPY packages/domains/game-event/package.json ./packages/domains/game-event/package.json
COPY packages/domains/text2speech/package.json ./packages/domains/text2speech/package.json
COPY packages/domains/configs/package.json ./packages/domains/configs/package.json
COPY packages/domains/command-data/package.json ./packages/domains/command-data/package.json
COPY packages/util/fixed-dsl/package.json ./packages/util/fixed-dsl/package.json
COPY packages/util/periodical-dsl/package.json ./packages/util/periodical-dsl/package.json
COPY packages/util/timing-to-notify-dsl/package.json ./packages/util/timing-to-notify-dsl/package.json
COPY packages/util/sound-mixing-proto/package.json ./packages/util/sound-mixing-proto/package.json
COPY packages/util/klasa-member-gateway/package.json ./packages/util/klasa-member-gateway/package.json
COPY packages/util/discordjs-gui/package.json ./packages/util/discordjs-gui/package.json
COPY packages/usecase/game-event/package.json ./packages/usecase/game-event/package.json
COPY packages/usecase/text2speech/package.json ./packages/usecase/text2speech/package.json
COPY packages/usecase/text2speech-grpc/package.json ./packages/usecase/text2speech-grpc/package.json
COPY packages/repository/gss/package.json ./packages/repository/gss/package.json
COPY packages/repository/schedule/package.json ./packages/repository/schedule/package.json
COPY packages/repository/mongodb-dictionary/package.json ./packages/repository/mongodb-dictionary/package.json
COPY packages/protocol/command-data-common/package.json ./packages/protocol/command-data-common/package.json
COPY packages/protocol/shared-config/package.json ./packages/protocol/shared-config/package.json
COPY packages/protocol/configs-klasa/package.json ./packages/protocol/configs-klasa/package.json
COPY packages/protocol/protos/package.json ./packages/protocol/protos/package.json
COPY packages/protocol/rpc-server/package.json ./packages/protocol/rpc-server/package.json
COPY packages/presentation/klasa-core-command-rewrite/package.json ./packages/presentation/klasa-core-command-rewrite/package.json
COPY packages/presentation/core/package.json ./packages/presentation/core/package.json
COPY packages/presentation/main/package.json ./packages/presentation/main/package.json

RUN  lerna bootstrap && apk del .ojt

COPY .eslintrc.json ./
COPY packages/domains/game-event ./packages/domains/game-event
COPY packages/domains/text2speech ./packages/domains/text2speech
COPY packages/domains/configs ./packages/domains/configs
COPY packages/domains/command-data ./packages/domains/command-data
COPY packages/util/fixed-dsl ./packages/util/fixed-dsl
COPY packages/util/periodical-dsl ./packages/util/periodical-dsl
COPY packages/util/timing-to-notify-dsl ./packages/util/timing-to-notify-dsl
COPY packages/util/sound-mixing-proto ./packages/util/sound-mixing-proto
COPY packages/util/klasa-member-gateway ./packages/util/klasa-member-gateway
COPY packages/util/discordjs-gui ./packages/util/discordjs-gui
COPY packages/usecase/game-event ./packages/usecase/game-event
COPY packages/usecase/text2speech ./packages/usecase/text2speech
COPY packages/usecase/text2speech-grpc ./packages/usecase/text2speech-grpc
COPY packages/repository/gss ./packages/repository/gss
COPY packages/repository/schedule ./packages/repository/schedule
COPY packages/repository/mongodb-dictionary ./packages/repository/mongodb-dictionary
COPY packages/protocol/command-data-common ./packages/protocol/command-data-common
COPY packages/protocol/shared-config ./packages/protocol/shared-config
COPY packages/protocol/configs-klasa ./packages/protocol/configs-klasa
COPY packages/protocol/protos ./packages/protocol/protos
COPY packages/protocol/rpc-server ./packages/protocol/rpc-server
COPY packages/presentation/klasa-core-command-rewrite ./packages/presentation/klasa-core-command-rewrite
COPY packages/presentation/core ./packages/presentation/core
COPY packages/presentation/main ./packages/presentation/main
RUN lerna run build \
    && lerna run test:lint \
    && yarn global remove lerna \
    && yarn cache clean 
COPY docker-entrypoint.sh /usr/local/bin/entrypoint.sh
RUN date >/build-date
ENTRYPOINT ["entrypoint.sh"]
CMD ["node","./packages/presentation/main/dist/main.js"]