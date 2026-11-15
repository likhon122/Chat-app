# ==============================================================================
# Production Dockerfile for Chat Application Backend (Node.js + Express + Socket.IO)
# ==============================================================================

FROM node:20-alpine AS production

# Install dumb-init to handle process signals (SIGINT, SIGTERM) as PID 1
RUN apk add --no-cache dumb-init

# Define environment variables
ENV NODE_ENV=production \
    PORT=7777

# Set application directory
WORKDIR /usr/src/app

# Copy package manifests for deterministic layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source code with non-root ownership
COPY --chown=node:node . .

# Switch to the non-root 'node' user
USER node

# Expose application port
EXPOSE 7777

# Built-in container health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:7777/api/v1/health || exit 1

# Launch application via dumb-init for graceful shutdown
CMD ["dumb-init", "node", "src/server.js"]
