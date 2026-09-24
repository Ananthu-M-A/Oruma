FROM node:22-alpine AS deps

WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci

FROM deps AS build

WORKDIR /app/server
COPY server/ ./
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine AS runner

ENV NODE_ENV=production
WORKDIR /app/server

COPY --from=build --chown=node:node /app/server/package*.json ./
COPY --from=build --chown=node:node /app/server/node_modules ./node_modules
COPY --from=build --chown=node:node /app/server/dist ./dist
COPY --chown=node:node config/business.json /app/config/business.json

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q -O - http://127.0.0.1:3000/ready >/dev/null || exit 1

CMD ["node", "dist/src/main.js"]
