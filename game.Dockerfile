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

RUN npm run build:game:${NODE_ENV}

FROM nginx:alpine
COPY docker/static.nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist/static /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
