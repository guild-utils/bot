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
COPY packages/domains/text2speech/package.json ./packages/domains/text2speech/package.json
COPY packages/domains/configs/package.json ./packages/domains/configs/package.json
COPY packages/domains/command-data/package.json ./packages/domains/command-data/package.json
COPY packages/usecase/text2speech/package.json ./packages/usecase/text2speech/package.json
COPY packages/usecase/text2speech-grpc/package.json ./packages/usecase/text2speech-grpc/package.json
COPY packages/presentation/command-data-common/package.json ./packages/presentation/command-data-common/package.json
COPY packages/presentation/command-data-discord/package.json ./packages/presentation/command-data-discord/package.json
COPY packages/presentation/shared-config/package.json ./packages/presentation/shared-config/package.json
COPY packages/presentation/protos/package.json ./packages/presentation/protos/package.json
COPY packages/presentation/rpc-client/package.json ./packages/presentation/rpc-client/package.json
COPY packages/presentation/klasa-core-command-rewrite/package.json ./packages/presentation/klasa-core-command-rewrite/package.json
COPY packages/presentation/core/package.json ./packages/presentation/core/package.json
COPY packages/presentation/sub/package.json ./packages/presentation/sub/package.json

RUN lerna bootstrap && apk del .ojt

COPY kick.js ./
COPY .eslintrc.json ./
COPY packages/util/sound-mixing-proto ./packages/util/sound-mixing-proto
COPY packages/domains/text2speech ./packages/domains/text2speech
COPY packages/domains/configs ./packages/domains/configs
COPY packages/domains/command-data ./packages/domains/command-data
COPY packages/usecase/text2speech ./packages/usecase/text2speech
COPY packages/usecase/text2speech-grpc ./packages/usecase/text2speech-grpc
COPY packages/presentation/command-data-common ./packages/presentation/command-data-common
COPY packages/presentation/command-data-discord ./packages/presentation/command-data-discord
COPY packages/presentation/shared-config ./packages/presentation/shared-config
COPY packages/presentation/protos ./packages/presentation/protos
COPY packages/presentation/rpc-client ./packages/presentation/rpc-client
COPY packages/presentation/klasa-core-command-rewrite ./packages/presentation/klasa-core-command-rewrite
COPY packages/presentation/core ./packages/presentation/core
COPY packages/presentation/sub ./packages/presentation/sub
RUN lerna run build \
    && lerna run test:lint \
    && yarn global remove lerna \
    && yarn cache clean 
ENV GUILD_UTILS_J_ROLE sub
CMD [ "pm2","--no-daemon","start","kick.js","--name","guild-utils-j"]