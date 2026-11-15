# ==============================================================================
# Multi-Stage Production Dockerfile for Chat Application Frontend (React + Vite + Nginx)
# ==============================================================================

# Stage 1: Build the React SPA
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Deterministic install of dependencies
RUN npm ci

# Copy client source code
COPY . .

# Build arguments for frontend SPA bundle (injected at build time, not runtime file)
ARG VITE_SERVER_URL=""
ARG VITE_VAPID_PUBLIC_KEY=""
ENV VITE_SERVER_URL=$VITE_SERVER_URL \
    VITE_VAPID_PUBLIC_KEY=$VITE_VAPID_PUBLIC_KEY

# Build production bundle
RUN npm run build

# Stage 2: Serve with lightweight Nginx Alpine
FROM nginx:1.27-alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration with SPA routing and WebSocket reverse proxying
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled production assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Built-in container health check
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/healthz || exit 1

# Launch Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
