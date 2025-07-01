# Backoffice Production Dockerfile
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
COPY backoffice/package.json ./backoffice/

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
COPY --from=deps /app/backoffice/node_modules ./backoffice/node_modules
COPY . .

# Build shared package first
WORKDIR /app/shared
RUN pnpm build

# Build backoffice with optimizations
WORKDIR /app/backoffice
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build with production flags and cache
RUN --mount=type=cache,target=/app/backoffice/.next/cache \
    pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set environment variables
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3002 \
    HOSTNAME="0.0.0.0"

# Copy only necessary files
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/backoffice/package.json ./backoffice/

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
COPY --from=builder /app/backoffice/.next/standalone ./
COPY --from=builder /app/backoffice/.next/static ./backoffice/.next/static
COPY --from=builder /app/backoffice/public ./backoffice/public

# Set proper permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

# Expose port
EXPOSE ${PORT}

# Start the application
CMD ["node", "backoffice/server.js"] 