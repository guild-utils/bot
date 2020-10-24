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
COPY packages/domains/command-data/package.json ./packages/domains/command-data/package.json
COPY packages/domains/game-event/package.json ./packages/domains/game-event/package.json
COPY packages/domains/guild-configs/package.json ./packages/domains/guild-configs/package.json
COPY packages/domains/guild-tts-target-channels/package.json ./packages/domains/guild-tts-target-channels/package.json
COPY packages/domains/text2speech/package.json ./packages/domains/text2speech/package.json
COPY packages/domains/voice-configs/package.json ./packages/domains/voice-configs/package.json
COPY packages/domains/voice-configs-write/package.json ./packages/domains/voice-configs-write/package.json
COPY packages/domains/meta/package.json ./packages/domains/meta/package.json
COPY packages/util/@types/mongo-dot-notation/package.json ./packages/util/@types/mongo-dot-notation/package.json
COPY packages/util/xorshift/package.json ./packages/util/xorshift/package.json
COPY packages/util/fixed-dsl/package.json ./packages/util/fixed-dsl/package.json
COPY packages/util/periodical-dsl/package.json ./packages/util/periodical-dsl/package.json
COPY packages/util/timing-to-notify-dsl/package.json ./packages/util/timing-to-notify-dsl/package.json
COPY packages/util/sound-mixing-proto/package.json ./packages/util/sound-mixing-proto/package.json
COPY packages/util/discordjs-gui/package.json ./packages/util/discordjs-gui/package.json
COPY packages/util/monitor-discord.js/package.json ./packages/util/monitor-discord.js/package.json
COPY packages/util/@guild-utils/command-base/package.json ./packages/util/@guild-utils/command-base/package.json
COPY packages/util/@guild-utils/command-parser/package.json ./packages/util/@guild-utils/command-parser/package.json
COPY packages/util/@guild-utils/command-schema/package.json ./packages/util/@guild-utils/command-schema/package.json
COPY packages/util/@guild-utils/command-types/package.json ./packages/util/@guild-utils/command-types/package.json
COPY packages/util/@guild-utils/command-types-discord.js/package.json ./packages/util/@guild-utils/command-types-discord.js/package.json
COPY packages/usecase/game-event/package.json ./packages/usecase/game-event/package.json
COPY packages/usecase/text2speech/package.json ./packages/usecase/text2speech/package.json
COPY packages/usecase/text2speech-grpc/package.json ./packages/usecase/text2speech-grpc/package.json
COPY packages/repository/cache-guild-configs/package.json ./packages/repository/cache-guild-configs/package.json
COPY packages/repository/cache-guild-tts-target-channels/package.json ./packages/repository/cache-guild-tts-target-channels/package.json
COPY packages/repository/cache-voice-configs/package.json ./packages/repository/cache-voice-configs/package.json
COPY packages/repository/mongodb-dictionary/package.json ./packages/repository/mongodb-dictionary/package.json
COPY packages/repository/mongodb-guild-configs/package.json ./packages/repository/mongodb-guild-configs/package.json
COPY packages/repository/mongodb-guild-tts-target-channels/package.json ./packages/repository/mongodb-guild-tts-target-channels/package.json
COPY packages/repository/mongodb-voice-configs/package.json ./packages/repository/mongodb-voice-configs/package.json
COPY packages/protocol/command-data-common/package.json ./packages/protocol/command-data-common/package.json
COPY packages/protocol/shared-config/package.json ./packages/protocol/shared-config/package.json
COPY packages/protocol/configs-klasa/package.json ./packages/protocol/configs-klasa/package.json
COPY packages/protocol/protos/package.json ./packages/protocol/protos/package.json
COPY packages/protocol/rpc-server/package.json ./packages/protocol/rpc-server/package.json
COPY packages/protocol/configurate-usecase/package.json ./packages/protocol/configurate-usecase/package.json
COPY packages/protocol/command-schema-core/package.json ./packages/protocol/command-schema-core/package.json
COPY packages/protocol/command-schema-main/package.json ./packages/protocol/command-schema-main/package.json
COPY packages/protocol/util-djs/package.json ./packages/protocol/util-djs/package.json
COPY packages/presentation/guild-config-adapter/package.json ./packages/presentation/guild-config-adapter/package.json
COPY packages/presentation/core/package.json ./packages/presentation/core/package.json
COPY packages/presentation/main/package.json ./packages/presentation/main/package.json
COPY packages/languages/command-core/package.json ./packages/languages/command-core/package.json
COPY packages/languages/command-main/package.json ./packages/languages/command-main/package.json

RUN  lerna bootstrap && apk del .ojt

COPY .eslintrc.json ./
COPY packages/domains/command-data ./packages/domains/command-data
COPY packages/domains/game-event ./packages/domains/game-event
COPY packages/domains/guild-configs ./packages/domains/guild-configs
COPY packages/domains/guild-tts-target-channels ./packages/domains/guild-tts-target-channels
COPY packages/domains/text2speech ./packages/domains/text2speech
COPY packages/domains/voice-configs ./packages/domains/voice-configs
COPY packages/domains/voice-configs-write ./packages/domains/voice-configs-write
COPY packages/domains/meta ./packages/domains/meta
COPY packages/util/@types/mongo-dot-notation ./packages/util/@types/mongo-dot-notation
COPY packages/util/xorshift ./packages/util/xorshift
COPY packages/util/fixed-dsl ./packages/util/fixed-dsl
COPY packages/util/periodical-dsl ./packages/util/periodical-dsl
COPY packages/util/timing-to-notify-dsl ./packages/util/timing-to-notify-dsl
COPY packages/util/sound-mixing-proto ./packages/util/sound-mixing-proto
COPY packages/util/discordjs-gui ./packages/util/discordjs-gui
COPY packages/util/monitor-discord.js ./packages/util/monitor-discord.js
COPY packages/util/@guild-utils/command-base ./packages/util/@guild-utils/command-base
COPY packages/util/@guild-utils/command-parser ./packages/util/@guild-utils/command-parser
COPY packages/util/@guild-utils/command-schema ./packages/util/@guild-utils/command-schema
COPY packages/util/@guild-utils/command-types ./packages/util/@guild-utils/command-types
COPY packages/util/@guild-utils/command-types-discord.js ./packages/util/@guild-utils/command-types-discord.js
COPY packages/usecase/game-event ./packages/usecase/game-event
COPY packages/usecase/text2speech ./packages/usecase/text2speech
COPY packages/usecase/text2speech-grpc ./packages/usecase/text2speech-grpc
COPY packages/repository/cache-guild-configs ./packages/repository/cache-guild-configs
COPY packages/repository/cache-guild-tts-target-channels ./packages/repository/cache-guild-tts-target-channels
COPY packages/repository/cache-voice-configs ./packages/repository/cache-voice-configs
COPY packages/repository/mongodb-dictionary ./packages/repository/mongodb-dictionary
COPY packages/repository/mongodb-guild-configs ./packages/repository/mongodb-guild-configs
COPY packages/repository/mongodb-guild-tts-target-channels ./packages/repository/mongodb-guild-tts-target-channels
COPY packages/repository/mongodb-voice-configs ./packages/repository/mongodb-voice-configs
COPY packages/protocol/command-data-common ./packages/protocol/command-data-common
COPY packages/protocol/shared-config ./packages/protocol/shared-config
COPY packages/protocol/configs-klasa ./packages/protocol/configs-klasa
COPY packages/protocol/protos ./packages/protocol/protos
COPY packages/protocol/rpc-server ./packages/protocol/rpc-server
COPY packages/protocol/configurate-usecase ./packages/protocol/configurate-usecase
COPY packages/protocol/command-schema-core ./packages/protocol/command-schema-core
COPY packages/protocol/command-schema-main ./packages/protocol/command-schema-main
COPY packages/protocol/util-djs ./packages/protocol/util-djs
COPY packages/presentation/guild-config-adapter ./packages/presentation/guild-config-adapter
COPY packages/presentation/core ./packages/presentation/core
COPY packages/presentation/main ./packages/presentation/main
COPY packages/languages/command-core ./packages/languages/command-core
COPY packages/languages/command-main ./packages/languages/command-main

RUN lerna run build \
    && lerna run test:lint \
    && yarn global remove lerna \
    && yarn cache clean 
COPY docker-entrypoint.sh ./entrypoint.sh
RUN date >/build-date
ARG GIT_SHORT_COMMIT_HASH
ENV GIT_SHORT_COMMIT_HASH ${GIT_SHORT_COMMIT_HASH:-xxxxxxx}
ENTRYPOINT ["sh","./entrypoint.sh"]
CMD ["node","./packages/presentation/main/dist/main.js"]