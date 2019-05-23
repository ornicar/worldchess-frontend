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

RUN npm run build

FROM alpine:3.7 as release

COPY --from=builder /app/dist /app

ENTRYPOINT /bin/sh -c "while true; do sleep 100; done"
