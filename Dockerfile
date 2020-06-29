FROM node:lts-alpine as base

RUN npm cache verify \
  && npm config set unsafe-perm true \
  && npm install -g @angular/cli

WORKDIR /app

COPY package-lock.json package.json /app/

RUN set -ex; npm install

FROM base as builder

ARG NODE_ENV

COPY ./angular.json ./tsconfig.json ./tslint.json ./webpack.config.js  /app/

COPY ./src /app/src

COPY ./config /app/config

COPY ./server.ts /app/server.ts

RUN npm run build

RUN npx tsc server.ts --lib dom,es2017,es2015
