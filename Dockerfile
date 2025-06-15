# Multi-stage build for production
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application 
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S devops -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies and drizzle-kit for migrations
RUN npm ci --include=dev && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=devops:nodejs /app/dist ./dist
COPY --from=builder --chown=devops:nodejs /app/server ./server
COPY --from=builder --chown=devops:nodejs /app/shared ./shared
COPY --from=builder --chown=devops:nodejs /app/drizzle.config.ts ./drizzle.config.ts

# Change ownership of the app directory
RUN chown -R devops:nodejs /app

# Switch to non-root user
USER devops

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]