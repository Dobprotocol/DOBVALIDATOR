# Backend Production Dockerfile
FROM node:18-alpine AS base

# Install dependencies and enable cstore
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@8.15.4
RUN pnpm config set store-dir /root/.pnpm-store

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy lockfiles for better caching
COPY pnpm-lock.yaml ./
COPY package.json pnpm-workspace.yaml ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

# Install dependencies with cache
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
    if [ -f pnpm-lock.yaml ]; then \
      pnpm install --prefer-frozen-lockfile || pnpm install; \
    else \
      pnpm install; \
    fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy workspace files and dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY . .

# Build shared package first
WORKDIR /app/shared
RUN pnpm build

# Build backend with optimizations
WORKDIR /app/backend
ENV NODE_ENV=production

# Generate Prisma client and build
RUN npx prisma generate
RUN mkdir -p dist && pnpm build

# Production image, copy all the files and run
FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set environment variables
ENV NODE_ENV=production \
    PORT=3001 \
    HOSTNAME="0.0.0.0"

# Copy only necessary files
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/backend/package.json ./backend/

# Install only production dependencies with cache
COPY pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
    if [ -f pnpm-lock.yaml ]; then \
      pnpm install --prod --prefer-frozen-lockfile || pnpm install --prod; \
    else \
      pnpm install --prod; \
    fi

# Copy built application
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

# Set proper permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

EXPOSE ${PORT}
CMD ["node", "backend/dist/index.js"] 