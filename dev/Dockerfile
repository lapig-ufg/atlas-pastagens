# Build initial image
ARG IMAGE_NODE_ALPINE_VERSION=node:14-alpine3.15 

FROM ${IMAGE_NODE_ALPINE_VERSION} as builder

LABEL maintainer="Renato Gomes <renatogomessilverio@gmail.com>"

WORKDIR /APP

ENV URL_TO_APPLICATION_GITHUB="https://github.com/lapig-ufg/atlas-pastagens.git"
ENV BRANCH="develop"

RUN /bin/sh -c "apk add --no-cache bash" && \
    npm install -g @angular/cli@8 && npm install always -g 

FROM node:14-alpine3.15  as runner 

COPY --from=builder /usr/lib /usr/lib
COPY --from=builder /usr/local/share /usr/local/share
COPY --from=builder /usr/local/lib /usr/local/lib
COPY --from=builder /usr/local/include /usr/local/include
COPY --from=builder /usr/local/bin /usr/local/bin

ENV URL_TO_APPLICATION_GITHUB="https://github.com/lapig-ufg/atlas-pastagens.git"
ENV BRANCH="develop"

WORKDIR /APP

RUN apk add git vim && /bin/sh -c "apk add --no-cache bash" && echo 'figlet -t "Lapig Docker Atlas"' >> ~/.bashrc && \
    mkdir -p /APP && cd /APP && git clone -b ${BRANCH} ${URL_TO_APPLICATION_GITHUB} && \
    cd /APP/atlas-pastagens/src/server && npm install && \ 
    cd /APP/atlas-pastagens/src/client && npm install 

SHELL ["/bin/bash", "-c"]
