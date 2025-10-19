## ------------------------------
## 1️⃣ Build stage
## ------------------------------
#FROM node:20-alpine AS builder
#
## Set working directory
#WORKDIR /app
#
## Copy package files first (better caching)
#COPY package*.json ./
#
## Install all dependencies
#RUN npm ci
#
## Copy all source files
#COPY .. .
#
## Set environment to production to skip dotenv loading during build
#ENV NODE_ENV=production
#
## Build TypeScript to JavaScript
#RUN npm run build
#
## ------------------------------
## 2️⃣ Production stage
## ------------------------------
#FROM node:20-alpine AS production
#
## Set working directory
#WORKDIR /app
#
## Copy only the built output and essentials
#COPY --from=builder /app/package*.json ./
#COPY --from=builder /app/dist ./dist
#COPY --from=builder /app/config ./config
#
## Install only production dependencies
#RUN npm ci --omit=dev
#
## Expose your app port
#EXPOSE 3000
#
## Define environment variables (can be overridden in Railway)
#ENV NODE_ENV=production
#
## Start the backend
#CMD ["npm", "run", "start"]


# ------------------------------
# 1️⃣ Build stage
# ------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm ci

# Copy all source files
COPY . .

# Build TypeScript → JavaScript
RUN npm run build

# ------------------------------
# 2️⃣ Production stage
# ------------------------------
FROM node:20-alpine AS production

WORKDIR /app

# Copy necessary files from build stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/config ./config

RUN npm ci --omit=dev

EXPOSE 3000
ENV NODE_ENV=production

# Run migrations first (optional but recommended)
CMD ["sh", "-c", "npm run migrate && npm start"]
