FROM alpine:3.12 AS build-ojt

WORKDIR /usr/builder
RUN apk add --no-cache libopusenc-dev build-base automake autoconf m4 perl

COPY packages/util/open-jtalk/soft/hts_engine_API-1.10 ./hts_engine_API-1.10

RUN cd hts_engine_API-1.10 \
    && find ./ -type f -print | xargs chmod 777 \
    && autoreconf -f -i \
    && ./configure --with-charset=UTF-8 \
    && make \
    && make install 
COPY packages/util/open-jtalk/soft/open_jtalk-1.11 ./open_jtalk-1.11

RUN cd open_jtalk-1.11 \
    && find ./ -type f -print | xargs chmod 777 \
    && autoreconf -f -i \
    && ./configure --with-charset=UTF-8 \
    && make \
    && make install 

FROM node:14-alpine AS runtime

WORKDIR /usr/app

RUN yarn global add pm2

ENV OPEN_JTALK_BIN /usr/local/bin/open_jtalk
ENV OPEN_JTALK_DIC /usr/local/dic
ENV OPEN_JTALK_OUTPUT OO

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

COPY --from=build-ojt /usr/local/bin/open_jtalk /usr/local/bin/open_jtalk
COPY --from=build-ojt /usr/local/dic /usr/local/dic

COPY packages/util/open-jtalk/htsvoice ./packages/util/open-jtalk/htsvoice
COPY packages/util/kuromoji-js/dict /usr/app/packages/util/kuromoji-js/dict
COPY kick.js ./
COPY lerna.json ./
COPY tsconfig.json ./
COPY package.json ./
COPY yarn.lock ./

COPY packages/domains/core ./packages/domains/core
COPY packages/domains/configs ./packages/domains/configs
COPY packages/util/fixed-dsl ./packages/util/fixed-dsl
COPY packages/util/periodical-dsl ./packages/util/periodical-dsl
COPY packages/util/timing-to-notify-dsl ./packages/util/timing-to-notify-dsl
COPY packages/usecase ./packages/usecase
COPY packages/repository/gss ./packages/repository/gss
COPY packages/repository/schedule ./packages/repository/schedule
COPY packages/presentation/shared-config ./packages/presentation/shared-config
COPY packages/presentation/klasa-member-gateway ./packages/presentation/klasa-member-gateway
COPY packages/presentation/klasa ./packages/presentation/klasa
COPY packages/presentation/rpc-server ./packages/presentation/rpc-server

RUN apk add --no-cache --virtual .ojt git \
    && yarn global add lerna\
    && lerna bootstrap \
    && lerna run build \
    && yarn global remove lerna \
    && yarn cache clean \
    && apk del .ojt
CMD [ "pm2","--no-daemon","start","kick.js","--name","guild-utils-j"]