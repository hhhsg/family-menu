# Stage 1: Build
FROM node:20-slim AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Build Next.js standalone
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 2: Production runtime
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update && apt-get install -y --no-install-recommends wget && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd -g 1001 nodejs && \
    useradd -m -u 1001 -g nodejs nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Create data directory for SQLite
RUN mkdir -p /app/data/backups && chown -R nextjs:nodejs /app/data

USER nextjs
EXPOSE 3000

ENV PORT=3000
ENV DATABASE_PATH=/app/data/family-menu.db

CMD ["node", "server.js"]
