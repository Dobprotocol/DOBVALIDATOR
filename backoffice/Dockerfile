# Backoffice Production Dockerfile
FROM node:18-alpine AS base

# Install dependencies
RUN apk add --no-cache libc6-compat curl
RUN npm install -g pnpm@8.15.4

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml ./
COPY shared/package.json ./shared/
COPY backoffice/package.json ./backoffice/

# Install dependencies with specific version lock
RUN pnpm install --no-frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules
COPY --from=deps /app/backoffice/node_modules ./backoffice/node_modules

# Copy source code
COPY shared ./shared
COPY backoffice ./backoffice

# Build shared package first
WORKDIR /app/shared
RUN pnpm build

# Build backoffice with production optimizations
WORKDIR /app/backoffice
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Add build-time environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_FRONTEND_URL
ARG NEXT_PUBLIC_BACKOFFICE_URL
ARG NEXT_PUBLIC_STELLAR_NETWORK
ARG NEXT_PUBLIC_STELLAR_HORIZON_URL
ARG NEXT_PUBLIC_ADMIN_ROLE
ARG NEXT_PUBLIC_ENABLE_ADMIN_FEATURES

# Build with production flags
RUN NEXT_TELEMETRY_DISABLED=1 pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

# Copy only the necessary files
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/backoffice/package.json ./backoffice/

# Install only production dependencies
RUN pnpm install --prod --no-frozen-lockfile

# Copy built application
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backoffice/.next/standalone ./
COPY --from=builder /app/backoffice/.next/static ./backoffice/.next/static
COPY --from=builder /app/backoffice/public ./backoffice/public

# Set proper permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Add healthcheck with proper curl
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3002/api/health || exit 1

# Expose port
EXPOSE 3002

# Start the application with proper production flags
CMD ["node", "backoffice/server.js"] 