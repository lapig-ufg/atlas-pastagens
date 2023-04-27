FROM registry.lapig.iesa.ufg.br/lapig-images-homol/app_atlas:base

# Clone app and npm install on server
ENV URL_TO_APPLICATION_GITHUB="https://github.com/lapig-ufg/atlas-pastagens.git"
ENV BRANCH="develop"

LABEL maintainer="Renato Gomes <renatogomessilverio@gmail.com> Rocha Jairo <devjairomr.gmail.com.br>"

RUN if [ -d "/APP/atlas-pastagens" ]; then rm -Rf /APP/atlas-pastagens; fi  && \
    cd /APP && git clone -b ${BRANCH} ${URL_TO_APPLICATION_GITHUB}
    
ADD ./src/server/node_modules /APP/atlas-pastagens/src/server/node_modules  
ADD ./src/client/dist/client /APP/atlas-pastagens/src/client/dist/client
COPY ./version.jso* /APP

CMD [ "/bin/bash", "-c", "/APP/src/server/prod-start.sh; tail -f /dev/null"]

ENTRYPOINT [ "/APP/Monitora.sh"]

