# Frontend Dockerfile - Production optimized
FROM node:18-alpine AS base

# Install dependencies required for security and operation
RUN apk add --no-cache \
    curl \
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
COPY frontend/package.json ./frontend/
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
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules

# Copy source code
COPY shared ./shared
COPY frontend ./frontend
COPY tsconfig.json ./

# Build shared package first
WORKDIR /app/shared
RUN pnpm build

# Set build-time variables
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application with cache mount
WORKDIR /app/frontend
RUN --mount=type=cache,target=/app/frontend/.next/cache \
    pnpm build

# Production stage
FROM base AS runner

# Set environment variables
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /app && \
    chown -R nextjs:nodejs /app

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/shared ./shared

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Use dumb-init as entrypoint
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "server.js"] 