FROM node:lts-alpine as ts-compiler

WORKDIR /usr/app

COPY package*.json ./

COPY tsconfig*.json ./

RUN npm install 

COPY . .

RUN npm run build

CMD [ "node", "./lib/main.js" ]