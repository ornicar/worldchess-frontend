ARG IMAGE_TAG
FROM registry.usetech.ru/worldchess/tournament-bc-frontend/frontend:${IMAGE_TAG}-latest as base

FROM nginx:alpine

ARG DOMAIN_NAME
ENV DOMAIN_NAME=${DOMAIN_NAME}

COPY --from=base /app/dist /var/www/dist

COPY docker/nginx/nginx.conf /etc/nginx/conf.d/nginx.conf.template
RUN envsubst '$$DOMAIN_NAME' < /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
