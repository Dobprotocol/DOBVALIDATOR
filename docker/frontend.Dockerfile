# Frontend Dockerfile - Production optimized
FROM node:18-slim AS base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm@8.15.4

# Stage 1: Generate Prisma Client
FROM base AS prisma
WORKDIR /app/prisma

# Copy Prisma schema
COPY backend/prisma/schema.prisma ./schema.prisma

# Install Prisma CLI and generate client
RUN npm init -y && \
    npm install prisma@5.10.2 @prisma/client@5.10.2 && \
    npx prisma generate

# Stage 2: Dependencies
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/
COPY shared/package.json ./shared/
COPY pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Ensure Prisma client directories exist
RUN mkdir -p ./frontend/node_modules/.prisma ./frontend/node_modules/@prisma/client

# Copy Prisma client from prisma stage
COPY --from=prisma /app/prisma/node_modules/.prisma/client ./frontend/node_modules/.prisma/client
COPY --from=prisma /app/prisma/node_modules/@prisma/client ./frontend/node_modules/@prisma/client

# Stage 3: Builder
FROM base AS builder
WORKDIR /app

# Copy files from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules

# Copy source code
COPY shared ./shared
COPY frontend ./frontend
COPY tsconfig.json ./
COPY backend/prisma ./prisma

# Build shared package
WORKDIR /app/shared
RUN pnpm build

# Build frontend
WORKDIR /app/frontend
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://dob_user:dob_password@localhost:5432/dob_validator?schema=public"

RUN pnpm build

# Stage 4: Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Copy necessary files
COPY --from=builder /app/frontend/public ./public
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./.next/static

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1 