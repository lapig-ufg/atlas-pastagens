FROM lapig/app_atlas_new:base

LABEL maintainer="Tiago Gonçalves <tiagogoncalves@discente.ufg.br>"

ENV NODE_ENV=prod

ADD . /APP/atlas-pastagens
COPY ./version.jso* /APP/atlas-pastagens/client/dist/atlas-pastagens/assets/

WORKDIR /APP/atlas-pastagens/server