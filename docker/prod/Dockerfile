FROM lapig/app_atlas_new:base

LABEL maintainer="Tiago Gonçalves <tiagogoncalves@discente.ufg.br>"

ADD . /APP/atlas-pastagens
COPY ./version.jso* /APP/atlas-pastagens/client/dist/atlas-pastagens/assets/

CMD [ "/bin/bash", "-c", "/APP/server/start.sh; tail -f /dev/null"]

ENTRYPOINT [ "/APP/Monitora.sh"]