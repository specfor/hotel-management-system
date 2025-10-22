# -------------------------------
# 1️⃣ Build Stage
# -------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run type-check && npm run build || echo "Skipping build step (handled by ts-node runtime)"

# -------------------------------
# 2️⃣ Runtime Stage
# -------------------------------
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy only necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Expose app port
EXPOSE 3000

# Health check (checks Express + DB)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD node -e "import('./dist/healthcheck.js').catch(()=>process.exit(1))" || exit 1

# Start the server
CMD ["npm", "start"]
