FROM registry.lapig.iesa.ufg.br/lapig-images-homol/app-base:latest

# Clone app and npm install on server
ENV URL_TO_APPLICATION_GITHUB="https://github.com/lapig-ufg/atlas-pastagens.git"
ENV BRANCH="main"

LABEL maintainer="Renato Gomes <renatogomessilverio@gmail.com>"

RUN cd /APP && git clone -b ${BRANCH} ${URL_TO_APPLICATION_GITHUB} && \
    cd /APP/atlas-pastagens/src/server && npm install
    
ADD ./src/client/dist/client /APP/atlas-pastagens/src/client/dist/client

CMD [ "/bin/bash", "-c", "/APP/src/server/prod-start.sh; tail -f /dev/null"]

ENTRYPOINT [ "/APP/Monitora.sh"]
