#Stage 1 - definindo 

#Uso a imagem base que ja define a estrutura do projeto e instala as dependencias do sistema operacional e do angular
FROM lapig/app_atlas_new:base AS builder 

#cria o diretorio de trabalho dentro do container, onde o projeto vai ser copiado e onde os comandos vão ser executados
WORKDIR /app

#Copia os package pois são necessarios para instalar as dependencias do projeto
COPY client/package*.json ./

#Instala as dependencias do projeto e apaga dependeicias antigas por isso o c, para intalar de forma limpa
RUN npm ci

#copia o restante do projeto para dentro do container
COPY client/ ./

#Executa o build do projeto angular para gerar os arquivos de produção
RUN npm run build

#Stage 2 - definindo a imagem final que vai ser usada para rodar a aplicação
#Usa a imagem da mesma versão do node do angular, ja que foram criados na mesma pasta, então usaram o mesmo node
FROM node:22.12.0-alpine3.20

#Cria o diretorio de trabalho para a aplicação
WORKDIR /app/server

#Copia os arquivos de produção gerados no stage anterior para o diretorio de trabalho
COPY --from=builder /app/dist/atlas-pastagens/ /app/client/dist/atlas-pastagens/

#copia os arquivos de configuração do servidor para o diretorio de trabalho
COPY server/package*.json ./

#Instala as dependencias do servidor, mas apenas as de produção, por isso o omit=dev, para não instalar as dependencias de desenvolvimento
RUN npm ci 
#--omit=dev

#copia o restante dos arquivos do servidor para o diretorio de trabalho
COPY server/ ./

#Define a porta que a aplicação vai usar para rodar, nesse caso a porta 3000, que é a porta padrão do servidor express
EXPOSE 3000

#Define a variável de ambiente NODE_ENV como dev, para indicar que a aplicação está rodando em ambiente de desenvolvimento, isso pode ser usado para configurar o comportamento da aplicação de acordo com o ambiente, como por exemplo, habilitar logs mais detalhados ou usar um banco de dados diferente para desenvolvimento.
ENV NODE_ENV=dev

#Define o comando para rodar a aplicação, nesse caso o comando npm start, que é definido no package.json do servidor
CMD ["npm", "run", "start-server"]