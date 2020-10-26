FROM node:14-alpine AS runtime-sub

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

COPY packages/util/open-jtalk/htsvoice ./packages/util/open-jtalk/htsvoice
COPY packages/util/kuromoji-js/dict /usr/app/packages/util/kuromoji-js/dict

COPY lerna.json ./
COPY tsconfig.json ./
COPY package.json ./
COPY yarn.lock ./

COPY packages/util/sound-mixing-proto/package.json ./packages/util/sound-mixing-proto/package.json
COPY packages/util/monitor-discord.js/package.json ./packages/util/monitor-discord.js/package.json
COPY packages/util/rate-limit/package.json ./packages/util/rate-limit/package.json
COPY packages/util/@guild-utils/command-base/package.json ./packages/util/@guild-utils/command-base/package.json
COPY packages/util/@guild-utils/command-parser/package.json ./packages/util/@guild-utils/command-parser/package.json
COPY packages/util/@guild-utils/command-schema/package.json ./packages/util/@guild-utils/command-schema/package.json
COPY packages/util/@guild-utils/command-types/package.json ./packages/util/@guild-utils/command-types/package.json
COPY packages/util/@guild-utils/command-types-discord.js/package.json ./packages/util/@guild-utils/command-types-discord.js/package.json
COPY packages/domains/meta/package.json ./packages/domains/meta/package.json
COPY packages/domains/guild-tts-target-channels/package.json ./packages/domains/guild-tts-target-channels/package.json
COPY packages/domains/guild-configs/package.json ./packages/domains/guild-configs/package.json
COPY packages/domains/text2speech/package.json ./packages/domains/text2speech/package.json
COPY packages/domains/voice-configs/package.json ./packages/domains/voice-configs/package.json
COPY packages/domains/command-data/package.json ./packages/domains/command-data/package.json
COPY packages/domains/guild-configs/package.json ./packages/domains/guild-configs/package.json
COPY packages/repository/cache-guild-configs/package.json ./packages/repository/cache-guild-configs/package.json
COPY packages/repository/mongodb-guild-configs/package.json ./packages/repository/mongodb-guild-configs/package.json
COPY packages/repository/cache-guild-tts-target-channels/package.json ./packages/repository/cache-guild-tts-target-channels/package.json
COPY packages/repository/mongodb-guild-tts-target-channels/package.json ./packages/repository/mongodb-guild-tts-target-channels/package.json
COPY packages/usecase/text2speech/package.json ./packages/usecase/text2speech/package.json
COPY packages/usecase/text2speech-grpc/package.json ./packages/usecase/text2speech-grpc/package.json
COPY packages/protocol/configurate-usecase/package.json ./packages/protocol/configurate-usecase/package.json
COPY packages/protocol/command-data-common/package.json ./packages/protocol/command-data-common/package.json
COPY packages/protocol/shared-config/package.json ./packages/protocol/shared-config/package.json
COPY packages/protocol/protos/package.json ./packages/protocol/protos/package.json
COPY packages/protocol/rpc-client/package.json ./packages/protocol/rpc-client/package.json
COPY packages/protocol/command-schema-core/package.json ./packages/protocol/command-schema-core/package.json
COPY packages/protocol/util-djs/package.json ./packages/protocol/util-djs/package.json
COPY packages/presentation/guild-config-adapter/package.json ./packages/presentation/guild-config-adapter/package.json
COPY packages/presentation/core/package.json ./packages/presentation/core/package.json
COPY packages/presentation/sub/package.json ./packages/presentation/sub/package.json
COPY packages/languages/command-core/package.json ./packages/languages/command-core/package.json

RUN lerna bootstrap && apk del .ojt

COPY .eslintrc.json ./
COPY packages/util/sound-mixing-proto ./packages/util/sound-mixing-proto
COPY packages/util/monitor-discord.js ./packages/util/monitor-discord.js
COPY packages/util/rate-limit ./packages/util/rate-limit
COPY packages/util/@guild-utils/command-base ./packages/util/@guild-utils/command-base
COPY packages/util/@guild-utils/command-parser ./packages/util/@guild-utils/command-parser
COPY packages/util/@guild-utils/command-schema ./packages/util/@guild-utils/command-schema
COPY packages/util/@guild-utils/command-types ./packages/util/@guild-utils/command-types
COPY packages/util/@guild-utils/command-types-discord.js ./packages/util/@guild-utils/command-types-discord.js
COPY packages/domains/meta ./packages/domains/meta
COPY packages/domains/guild-tts-target-channels ./packages/domains/guild-tts-target-channels
COPY packages/domains/guild-configs ./packages/domains/guild-configs
COPY packages/domains/text2speech ./packages/domains/text2speech
COPY packages/domains/voice-configs ./packages/domains/voice-configs
COPY packages/domains/command-data ./packages/domains/command-data
COPY packages/repository/cache-guild-configs ./packages/repository/cache-guild-configs
COPY packages/repository/mongodb-guild-configs ./packages/repository/mongodb-guild-configs
COPY packages/repository/cache-guild-tts-target-channels ./packages/repository/cache-guild-tts-target-channels
COPY packages/repository/mongodb-guild-tts-target-channels ./packages/repository/mongodb-guild-tts-target-channels
COPY packages/usecase/text2speech ./packages/usecase/text2speech
COPY packages/usecase/text2speech-grpc ./packages/usecase/text2speech-grpc
COPY packages/protocol/configurate-usecase ./packages/protocol/configurate-usecase
COPY packages/protocol/command-data-common ./packages/protocol/command-data-common
COPY packages/protocol/shared-config ./packages/protocol/shared-config
COPY packages/protocol/protos ./packages/protocol/protos
COPY packages/protocol/rpc-client ./packages/protocol/rpc-client
COPY packages/protocol/command-schema-core ./packages/protocol/command-schema-core
COPY packages/protocol/util-djs ./packages/protocol/util-djs
COPY packages/presentation/guild-config-adapter ./packages/presentation/guild-config-adapter
COPY packages/presentation/core ./packages/presentation/core
COPY packages/presentation/sub ./packages/presentation/sub
COPY packages/languages/command-core ./packages/languages/command-core


RUN lerna run build \
    && lerna run test:lint \
    && yarn global remove lerna \
    && yarn cache clean 
COPY docker-entrypoint.sh ./entrypoint.sh
RUN date >/build-date
ARG GIT_SHORT_COMMIT_HASH
ENV GIT_SHORT_COMMIT_HASH ${GIT_SHORT_COMMIT_HASH:-xxxxxxx}
ENTRYPOINT ["sh","entrypoint.sh"]
CMD ["node","./packages/presentation/sub/dist/main.js"]
