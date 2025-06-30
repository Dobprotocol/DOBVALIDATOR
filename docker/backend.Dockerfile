# Backend Dockerfile - Production optimized
FROM node:18-alpine AS base

# Install dependencies required for Prisma and security
RUN apk add --no-cache \
    openssl \
    libc6-compat \
    curl \
    netcat-openbsd \
    # Add security packages
    dumb-init \
    # Clean up
    && rm -rf /var/cache/apk/*

# Install pnpm
RUN npm install -g pnpm@8.15.4

# Set working directory
WORKDIR /app

# Dependencies stage
FROM base AS deps
# Copy only package files for better layer caching
COPY package.json pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/
COPY pnpm-lock.yaml* ./

# Install dependencies with cache mount
RUN --mount=type=cache,target=/root/.pnpm-store \
    if [ -f pnpm-lock.yaml ]; then \
    pnpm install --frozen-lockfile; \
    else \
    pnpm install; \
    fi

# Builder stage
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules

# Copy source code
COPY shared ./shared
COPY backend ./backend
COPY tsconfig.json ./

# Build shared package first
WORKDIR /app/shared
RUN pnpm build

# Build backend
WORKDIR /app/backend
RUN pnpm add prisma@5.4.2 @prisma/client@5.4.2 && \
    pnpm prisma generate --schema=./prisma/schema.prisma && \
    pnpm build

# Production stage
FROM base AS runner

# Set environment variables
ENV NODE_ENV=production \
    PORT=3001 \
    HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs && \
    mkdir -p /app/uploads && \
    chown -R nodejs:nodejs /app

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=nodejs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/shared ./shared
COPY --from=builder --chown=nodejs:nodejs /app/backend/prisma ./backend/prisma
COPY --chown=nodejs:nodejs backend/start.sh ./backend/
RUN chmod +x backend/start.sh

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Use dumb-init as entrypoint
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["./backend/start.sh"] 