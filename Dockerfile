# Multi-stage Dockerfile for Doc Video Automation Pipeline
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run lint
RUN npm run build

# Production runtime image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install runtime dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built frontend assets and server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/scripts ./scripts

EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]
