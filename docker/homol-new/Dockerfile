FROM lapig/app_atlas_new:base

# Clone app and npm install on server
ENV URL_TO_APPLICATION_GITHUB="https://github.com/lapig-ufg/atlas-pastagens.git"
ENV BRANCH="update/atlas_1.0"

LABEL maintainer="Tiago Gonçalves <tiagogoncalves@discente.ufg.br>"

RUN if [ -d "/APP/atlas-pastagens" ]; then rm -Rf /APP/atlas-pastagens; fi  && \
    cd /APP && git clone -b ${BRANCH} ${URL_TO_APPLICATION_GITHUB}
    
ADD ./server/node_modules /APP/atlas-pastagens/server/node_modules  
ADD ./client/dist/client /APP/atlas-pastagens/client/dist/client
COPY ./version.jso* /APP/atlas-pastagens/client/dist/client/assets/

CMD [ "/bin/bash", "-c", "/APP/server/prod-start.sh; tail -f /dev/null"]

ENTRYPOINT [ "/APP/Monitora.sh"]

