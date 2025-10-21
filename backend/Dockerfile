# Use Node.js 24 Alpine as base image
FROM node:24-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and configs
COPY package*.json ./
COPY tsconfig*.json ./
COPY *.config.* ./
COPY config.* ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy configuration and source code
COPY config/ ./config/
COPY src/ ./src/
COPY scripts/ ./scripts/

# Debug: List files to verify copying
RUN ls -la *.config.* || echo "No config files found"

# Build the application
RUN npm run build

# Production stage
FROM node:24-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/config.js ./config.js

# Create necessary directories
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]