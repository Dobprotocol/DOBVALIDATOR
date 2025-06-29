# Backend Dockerfile - Optimized for faster builds
FROM node:18-alpine AS base

# Install curl for health checks, netcat for database connection checking, and OpenSSL for Prisma
RUN apk add --no-cache curl netcat-openbsd openssl libc6-compat

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install pnpm globally once
RUN npm install -g pnpm

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

# Install dependencies with cache mount for faster rebuilds
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules

# Copy source code
COPY shared ./shared
COPY backend ./backend

# Generate Prisma client and build the application
WORKDIR /app/backend
RUN --mount=type=cache,target=/root/.cache/prisma \
    npx prisma generate --schema=./prisma/schema.prisma && \
    npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3001 \
    HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs && \
    mkdir -p uploads && \
    chown -R nodejs:nodejs .

# Install pnpm and copy package files
RUN npm install -g pnpm
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps /app/shared/package.json ./shared/package.json
COPY --from=deps /app/backend/package.json ./backend/package.json

# Install production dependencies
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --prod && \
    cd shared && \
    pnpm install --prod

# Copy prisma directory and generate client
COPY --from=builder /app/backend/prisma ./backend/prisma
WORKDIR /app/backend
RUN --mount=type=cache,target=/root/.cache/prisma \
    npx prisma generate --schema=./prisma/schema.prisma
WORKDIR /app

# Copy built application and other necessary files
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/shared ./shared
COPY backend/start.sh ./start.sh
RUN chmod +x start.sh

USER nodejs

EXPOSE 3001

CMD ["./start.sh"] 