# Frontend Production Dockerfile
FROM node:18-alpine AS base

# Install dependencies
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy workspace files first
COPY package.json pnpm-workspace.yaml ./

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules

# Copy source code
COPY shared ./shared
COPY frontend ./frontend

# Build shared package first
WORKDIR /app/shared
RUN pnpm build

# Build frontend
WORKDIR /app/frontend
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build with production flags
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy workspace files first
COPY package.json pnpm-workspace.yaml ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/

# Install only production dependencies
RUN pnpm install --prod --no-frozen-lockfile

# Copy built application
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder /app/frontend/public ./frontend/public

# Set proper permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

# Expose port
EXPOSE ${PORT}

# Start the application
CMD ["node", "frontend/server.js"] 