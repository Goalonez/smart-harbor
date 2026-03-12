FROM node:24.11.1-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:24.11.1-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=80
ENV CONFIG_DIR=/app/config

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server
COPY --from=builder /app/src/config ./src/config

RUN mkdir -p /app/config

EXPOSE 80
CMD ["node", "dist-server/server/index.js"]
