FROM node:lts-alpine as ts-compiler

WORKDIR /usr/app

ENV NODE_ENV 'production'

COPY package*.json ./

RUN npm install 

COPY ./lib .

CMD [ "node", "./main.js" ]