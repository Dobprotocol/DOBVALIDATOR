# Backend Dockerfile - Optimized for faster builds
FROM node:18-alpine AS base

# Install curl for health checks, netcat for database connection checking, and OpenSSL for Prisma
RUN apk add --no-cache curl netcat-openbsd openssl libc6-compat

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install pnpm globally once
RUN npm install -g pnpm@8.15.4

# Copy only package files first for better layer caching
COPY package.json pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/

# Install dependencies with cache mount for faster rebuilds
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --no-frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install pnpm globally in builder stage
RUN npm install -g pnpm@8.15.4

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules

# Copy source code
COPY shared ./shared
COPY backend ./backend
COPY tsconfig.json ./

# Generate Prisma client and build the application
WORKDIR /app/backend
ENV PRISMA_CLI_BINARY_TARGETS=linux-musl
RUN cd /app/backend && \
    npx prisma generate --schema=./prisma/schema.prisma && \
    pnpm build

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

# Install only production dependencies
COPY --from=deps /app/package.json ./
COPY --from=deps /app/pnpm-workspace.yaml ./
COPY --from=deps /app/backend/package.json ./backend/
COPY --from=deps /app/shared/package.json ./shared/

# Install pnpm and production dependencies
RUN npm install -g pnpm@8.15.4 && \
    cd backend && pnpm install --prod --no-frozen-lockfile && \
    cd ../shared && pnpm install --prod --no-frozen-lockfile

# Copy prisma directory and generate client
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/node_modules/.prisma ./backend/node_modules/.prisma
COPY --from=builder /app/backend/node_modules/@prisma ./backend/node_modules/@prisma

# Copy built application
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/shared ./shared
COPY backend/start.sh ./backend/
RUN chmod +x backend/start.sh

USER nodejs
WORKDIR /app/backend

EXPOSE 3001

CMD ["./start.sh"] 