FROM node:lts-alpine as ts-compiler

WORKDIR /usr/app

ARG node_env='local'
ENV NODE_ENV $node_env

COPY package*.json ./

RUN npm install 

COPY ./lib .

CMD [ "node", "./main.js" ]