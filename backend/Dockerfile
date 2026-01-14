# Base stage - prepare dependencies
FROM node:20-alpine AS base
WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Builder stage - build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install ALL dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage - run the application
FROM node:20-alpine AS production
WORKDIR /app

# Copy production dependencies from base
COPY --from=base /app/node_modules ./node_modules

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy Prisma schema (needed for migrations)
COPY prisma ./prisma
COPY package*.json ./

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

USER nestjs

# Expose port
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3333/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start command
CMD ["node", "dist/main"]
