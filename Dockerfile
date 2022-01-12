FROM registry.lapig.iesa.ufg.br/lapig-images-homol/atlas-pastagens:latest

LABEL maintainer="Renato Gomes <renatogomessilverio@gmail.com>"

ADD ./src/client/dist/client /APP/atlas-pastagens/src/client/dist/client

CMD [ "/bin/bash", "-c", "/APP/src/server/prod-start.sh; tail -f /dev/null"]

ENTRYPOINT [ "/APP/Monitora.sh"]
