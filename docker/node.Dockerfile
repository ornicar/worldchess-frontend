ARG IMAGE_TAG
FROM registry.usetech.ru/worldchess/tournament-bc-frontend/frontend/${IMAGE_TAG}:latest as base
FROM node:lts-alpine as release

WORKDIR /app
ARG DOMAIN_NAME
ENV SERVER_PORT=8099
ENV API_SERVER=https://${DOMAIN_NAME}/api/

RUN mkdir /app/dist
COPY --from=base /app/dist/static/index.html /app/dist/index.html
COPY --from=base /app/server.js /app/server.js
COPY --from=base /app/node_modules /app/node_modules

CMD ["node", "server.js"]
