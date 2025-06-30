# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.15.4

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package files for all workspaces
COPY backoffice/package.json ./backoffice/
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# Install all dependencies at root level
RUN pnpm install --no-frozen-lockfile

# Copy source files
COPY backoffice ./backoffice
COPY shared ./shared
COPY tsconfig.json ./

# Build the application
WORKDIR /app/backoffice
RUN pnpm build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/backoffice/package.json ./package.json
COPY --from=builder /app/backoffice/.next/standalone ./
COPY --from=builder /app/backoffice/.next/static ./.next/static
COPY --from=builder /app/backoffice/public ./public

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"] 