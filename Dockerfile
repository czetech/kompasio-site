FROM node:lts AS build
WORKDIR /app
COPY package-lock.json package.json ./
RUN npm ci
COPY . .
RUN --mount=type=secret,id=DATABASE_URL \
    export DATABASE_URL=$(cat /run/secrets/DATABASE_URL) && \
    npm run build

FROM node:lts-alpine AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
EXPOSE 4321
ENV HOST="0.0.0.0"
CMD [ "node", "dist/server/entry.mjs" ]
