# Backend Builder Stage
FROM oven/bun:1 AS backend-builder
WORKDIR /app/backend

# Copy only dependency files first for better caching
COPY backend/package.json backend/bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy source code
COPY backend/ ./

# Build if needed (currently not required for Bun/TS)
RUN bun run build || echo "No build step needed"

# Frontend Builder Stage
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy package files
COPY frontend/package.json ./

# Install dependencies (use npm install since package-lock.json may not exist)
RUN npm install --legacy-peer-deps

# Copy frontend source
COPY frontend/ ./

# Build arguments for frontend environment
ARG VITE_API_URL=/api
ARG VITE_FROM_ADDRESSES
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_FROM_ADDRESSES=$VITE_FROM_ADDRESSES

# Build frontend
RUN npm run build

# Production Stage
FROM oven/bun:1-slim
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy backend dependencies and code from builder
COPY --from=backend-builder /app/backend/package.json /app/backend/bun.lockb* /app/backend/
WORKDIR /app/backend
RUN bun install --production

# Copy backend source
COPY --from=backend-builder /app/backend/src ./src

# Copy frontend build to backend's public folder
COPY --from=frontend-builder /app/frontend/dist ./public

# Create data directory with proper permissions
RUN mkdir -p /app/backend/data && \
    chown -R appuser:appuser /app/backend

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start backend (it will serve frontend static files)
CMD ["bun", "run", "src/index.ts"]
