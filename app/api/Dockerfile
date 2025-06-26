
FROM node:21 AS builder

WORKDIR /opt/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run precompile && npm run compile

FROM node:21-slim



ENV NODE_ENV production
ENV NODE_CONFIG_STRICT_MODE false
ENV VERSION ${VERSION}
ENV LOG_LEVEL error
WORKDIR /opt/app

RUN apt-get update && apt-get install -y --no-install-recommends dumb-init && rm -rf /var/lib/apt/lists/*

COPY --from=builder /opt/app/package*.json ./
COPY --from=builder /opt/app/node_modules ./node_modules
COPY --from=builder /opt/app/dist ./dist
COPY --from=builder /opt/app/config ./config

USER node
ENTRYPOINT [ "/usr/bin/dumb-init", "--" ]
CMD ["npm", "run", "start"]