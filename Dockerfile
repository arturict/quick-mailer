# Backend
FROM oven/bun:1 AS backend-builder
WORKDIR /app/backend
COPY backend/package.json backend/bun.lockb* ./
RUN bun install --frozen-lockfile
COPY backend/ ./
RUN bun run build || echo "No build step needed"

# Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ARG VITE_API_URL=/api
ARG VITE_FROM_ADDRESSES
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_FROM_ADDRESSES=$VITE_FROM_ADDRESSES
RUN npm run build

# Production
FROM oven/bun:1-slim
WORKDIR /app

# Copy backend
COPY --from=backend-builder /app/backend /app/backend
WORKDIR /app/backend
RUN bun install --production

# Copy frontend build to backend's public folder
COPY --from=frontend-builder /app/frontend/dist /app/backend/public

# Create data directory
RUN mkdir -p /app/backend/data

# Expose port
EXPOSE 3000

# Start backend (it will serve frontend static files)
CMD ["bun", "run", "src/index.ts"]
