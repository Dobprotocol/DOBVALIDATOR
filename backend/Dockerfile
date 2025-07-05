# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY backend/package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm

# Install all dependencies (including dev dependencies for build)
RUN pnpm install

# Copy source code
COPY backend/ .

# Generate Prisma client
RUN pnpm run db:generate

# Build the application
RUN pnpm run build

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 4000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["pnpm", "start"] 