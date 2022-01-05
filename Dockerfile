FROM registry.lapig.iesa.ufg.br/lapig-images-prod/app-base:latest

LABEL maintainer="Renato Gomes <renatogomessilverio@gmail.com>"

ADD ./src/client/dist/client /APP/plataform-base/src/client/dist/client

CMD [ "/bin/bash", "-c", "/APP/src/server/prod-start.sh; tail -f /dev/null"]

ENTRYPOINT [ "/APP/Monitora.sh"]
