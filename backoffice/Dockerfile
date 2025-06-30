# Backoffice Production Dockerfile
FROM node:18-alpine AS builder

# Install dependencies
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

WORKDIR /app

# Copy root configuration files
COPY package.json pnpm-workspace.yaml .npmrc ./

# Copy package files for all workspaces
COPY shared/package.json shared/.npmrc ./shared/
COPY backoffice/package.json ./backoffice/

# Build shared package first
COPY shared ./shared
WORKDIR /app/shared
RUN pnpm install
RUN pnpm build

# Install backoffice dependencies and build
WORKDIR /app
RUN pnpm install --filter=@dob-validator/backoffice...

# Copy backoffice source code
COPY backoffice ./backoffice

# Set working directory to backoffice
WORKDIR /app/backoffice

# Build backoffice
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Install production dependencies only
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/.npmrc ./
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/backoffice/package.json ./backoffice/

RUN npm install -g pnpm
RUN pnpm install --prod --filter=@dob-validator/backoffice...

# Copy built files and necessary runtime files
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backoffice/.next/standalone ./
COPY --from=builder /app/backoffice/.next/static ./backoffice/.next/static
COPY --from=builder /app/backoffice/public ./backoffice/public

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

# Expose port
EXPOSE ${PORT}

# Start production server
CMD ["node", "server.js"] 