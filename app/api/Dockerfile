# Builder stage: full Node.js 22 image with build tools
FROM node:22 AS builder

WORKDIR /opt/app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run precompile && npm run compile

# Final stage: minimal AWS Lambda Node.js 22 runtime image
FROM public.ecr.aws/lambda/nodejs:22

ENV NODE_ENV=production
ENV NODE_CONFIG_STRICT_MODE=false
ENV VERSION=${VERSION}
ENV LOG_LEVEL=error

WORKDIR /var/task

COPY --from=builder /opt/app/package.json ./
COPY --from=builder /opt/app/package-lock.json ./
COPY --from=builder /opt/app/node_modules ./node_modules
COPY --from=builder /opt/app/dist ./dist
COPY --from=builder /opt/app/config ./config


RUN ls -l dist
RUN ls -l dist/src || true

CMD ["dist/lambda.handler"]
