FROM node:18-alpine as fader_base
ADD work /work
WORKDIR /work
RUN yarn install
RUN yarn build

# production environment
FROM nginx:1.23.4-alpine-slim as fader_release
COPY --from=fader_base /work/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=fader_base /work/build /usr/share/nginx/html/editor
