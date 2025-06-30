# Backend Production Dockerfile
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
COPY backend/package.json ./backend/

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
COPY --from=deps /app/backend/node_modules ./backend/node_modules

# Copy source code
COPY shared ./shared
COPY backend ./backend

# Build shared package first
WORKDIR /app/shared
RUN pnpm build

# Build backend
WORKDIR /app/backend
ENV NODE_ENV=production

# Build with production flags
RUN pnpm build

# Production image, copy all the files and run
FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Copy workspace files first
COPY package.json pnpm-workspace.yaml ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

# Install only production dependencies
RUN pnpm install --prod --no-frozen-lockfile

# Copy built application
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backend/dist ./backend/dist

# Set proper permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

# Expose port
EXPOSE ${PORT}

# Start the application
CMD ["node", "backend/dist/index.js"] 