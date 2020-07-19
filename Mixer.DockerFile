FROM archlinux:20200705 AS build-ojt

WORKDIR /usr/builder

RUN pacman -Sy  --noconfirm grpc libopusenc base base-devel automake autoconf m4 perl opus
COPY packages/util/open-jtalk/soft/hts_engine_API-1.10 ./hts_engine_API-1.10
RUN cd hts_engine_API-1.10 \
    && find ./ -type f -print | xargs chmod 777 \
    && autoreconf -f -i \
    && ./configure --with-charset=UTF-8 \
    && make \
    && make install 
COPY packages/util/open-jtalk/soft/open_jtalk-1.11 ./open_jtalk-1.11
COPY packages/util/sound-mixing-proto ./sound-mixing-proto
RUN cd open_jtalk-1.11 \
    && find ./ -type f -print | xargs chmod 777 \
    && autoreconf -f -i \
    && ./configure --with-charset=UTF-8 \
    && make \
    && make install 

FROM archlinux:20200705 AS runtime
RUN pacman -Sy --noconfirm grpc libopusenc opus

COPY --from=build-ojt /usr/local/bin/open_jtalk /usr/local/bin/open_jtalk
COPY --from=build-ojt /usr/local/dic /usr/local/dic
COPY packages/util/open-jtalk/htsvoice ./htsvoice
ENV OPEN_JTALK_BIN /usr/local/bin/open_jtalk
ENV OPEN_JTALK_DIC /usr/local/dic
CMD ["open_jtalk"]