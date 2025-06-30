# Frontend Dockerfile - Production optimized
FROM node:18.19-slim as base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm@8.15.4

WORKDIR /app

# Stage 1: Dependencies
FROM base as deps

# Copy package files
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

# Stage 2: Prisma
FROM base as prisma

WORKDIR /app

# Copy Prisma schema
COPY backend/prisma ./prisma/

# Initialize package.json and install Prisma
RUN cd prisma && \
    npm init -y && \
    npm install prisma@3.15.2 && \
    npm install @prisma/client@3.15.2 && \
    npx prisma generate

# Stage 3: Builder
FROM base as builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules

# Copy Prisma client
COPY --from=prisma /app/prisma/node_modules/.prisma ./node_modules/.prisma
COPY --from=prisma /app/prisma/node_modules/@prisma ./node_modules/@prisma

# Copy source code
COPY shared ./shared
COPY frontend ./frontend
COPY tsconfig.json ./

# Build shared package
WORKDIR /app/shared
RUN pnpm build

# Build frontend
WORKDIR /app/frontend
RUN --mount=type=cache,target=/app/frontend/.next/cache \
    pnpm build

# Stage 4: Runner
FROM base as runner

# Create non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nodejs

WORKDIR /app

# Copy runtime files
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder /app/shared ./shared

# Switch to non-root user
USER nodejs

# Set environment variables
ENV NODE_ENV production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "frontend/server.js"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1 