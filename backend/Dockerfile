# Backend Production Dockerfile
FROM node:18-alpine AS builder

# Install dependencies
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

WORKDIR /app

# Copy root configuration files
COPY package.json pnpm-workspace.yaml .npmrc ./

# Copy package files for all workspaces
COPY shared/package.json shared/.npmrc ./shared/
COPY backend/package.json ./backend/

# Build shared package first
COPY shared ./shared
WORKDIR /app/shared
RUN pnpm install
RUN pnpm build

# Install backend dependencies and build
WORKDIR /app
RUN pnpm install --filter=@dob-validator/backend...

# Copy backend source code
COPY backend ./backend

# Set working directory to backend
WORKDIR /app/backend

# Generate Prisma client and build
RUN pnpm prisma generate
RUN pnpm build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Install production dependencies only
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/.npmrc ./
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/backend/package.json ./backend/

RUN npm install -g pnpm prisma
RUN pnpm install --prod --filter=@dob-validator/backend...

# Copy built files and necessary runtime files
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

# Set working directory to backend
WORKDIR /app/backend

# Generate Prisma client in production
RUN prisma generate

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3001}/health || exit 1

# Expose port
EXPOSE ${PORT:-3001}

# Set environment variables
ENV NODE_ENV=production
ENV PORT=${PORT:-3001}
ENV HOSTNAME="0.0.0.0"

# Start production server
CMD ["node", "dist/index.js"] 