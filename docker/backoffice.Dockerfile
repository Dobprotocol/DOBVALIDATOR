# Backoffice Dockerfile - Optimized for faster builds
FROM node:18-alpine AS base

# Install curl and libc6-compat
RUN apk add --no-cache curl libc6-compat

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install pnpm globally once
RUN npm install -g pnpm@8.15.4

# Copy only package files first for better layer caching
COPY package.json pnpm-workspace.yaml ./
COPY backoffice/package.json ./backoffice/
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
COPY --from=deps /app/backoffice/node_modules ./backoffice/node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules

# Copy source code
COPY shared ./shared
COPY backoffice ./backoffice
COPY tsconfig.json ./

# Next.js collects completely anonymous telemetry data about general usage.
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application with cache mount for faster rebuilds
WORKDIR /app/backoffice
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs .

# Install only production dependencies
COPY --from=deps /app/package.json ./
COPY --from=deps /app/pnpm-workspace.yaml ./
COPY --from=deps /app/backoffice/package.json ./backoffice/
COPY --from=deps /app/shared/package.json ./shared/

# Install pnpm and production dependencies
RUN npm install -g pnpm@8.15.4 && \
    cd backoffice && pnpm install --prod --no-frozen-lockfile && \
    cd ../shared && pnpm install --prod --no-frozen-lockfile

# Copy built application (excluding cache directory)
COPY --from=builder /app/backoffice/public ./backoffice/public
COPY --from=builder /app/backoffice/.next/standalone ./
COPY --from=builder /app/backoffice/.next/static ./backoffice/.next/static
COPY --from=builder /app/shared ./shared

USER nextjs
WORKDIR /app/backoffice

EXPOSE 3000

# Use the standalone server for better performance
CMD ["node", "server.js"] 