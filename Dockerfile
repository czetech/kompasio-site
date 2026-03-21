FROM node:lts AS build
WORKDIR /app
COPY package-lock.json package.json ./
RUN npm ci
COPY . .
ARG PUBLIC_PLACES_ORIGIN
RUN npm run build:astro

FROM nginx:alpine
COPY docker-nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist-astro /usr/share/nginx/html
