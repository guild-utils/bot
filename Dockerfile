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

RUN yarn global add pm2

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
COPY kick.js ./
COPY lerna.json ./
COPY tsconfig.json ./
COPY package.json ./
COPY yarn.lock ./

COPY packages/domains/game-event ./packages/domains/game-event
COPY packages/domains/text2speech ./packages/domains/text2speech
COPY packages/domains/configs ./packages/domains/configs
COPY packages/domains/command-data ./packages/domains/command-data
COPY packages/util/fixed-dsl ./packages/util/fixed-dsl
COPY packages/util/periodical-dsl ./packages/util/periodical-dsl
COPY packages/util/timing-to-notify-dsl ./packages/util/timing-to-notify-dsl
COPY packages/util/sound-mixing-proto ./packages/util/sound-mixing-proto
COPY packages/usecase/game-event ./packages/usecase/game-event
COPY packages/usecase/text2speech ./packages/usecase/text2speech
COPY packages/usecase/text2speech-grpc ./packages/usecase/text2speech-grpc
COPY packages/repository/gss ./packages/repository/gss
COPY packages/repository/schedule ./packages/repository/schedule
COPY packages/presentation/command-data-common ./packages/presentation/command-data-common
COPY packages/presentation/command-data-discord ./packages/presentation/command-data-discord
COPY packages/presentation/shared-config ./packages/presentation/shared-config
COPY packages/presentation/klasa-member-gateway ./packages/presentation/klasa-member-gateway
COPY packages/presentation/configs-klasa ./packages/presentation/configs-klasa
COPY packages/presentation/protos ./packages/presentation/protos
COPY packages/presentation/rpc-server ./packages/presentation/rpc-server
COPY packages/presentation/klasa-core-command-rewrite ./packages/presentation/klasa-core-command-rewrite
COPY packages/presentation/core ./packages/presentation/core
COPY packages/presentation/main ./packages/presentation/main

RUN apk add --no-cache --virtual .ojt git \
    && yarn global add lerna\
    && lerna bootstrap \
    && lerna run build \
    && yarn global remove lerna \
    && yarn cache clean \
    && apk del .ojt
ENV GUILD_UTILS_J_ROLE main

CMD [ "pm2","--no-daemon","start","kick.js","--name","guild-utils-j"]