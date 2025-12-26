# Multi-stage build for React + Vite frontend

FROM node:20-alpine
WORKDIR /app

# Copy package files for better layer caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port 4173 (Vite preview default)
EXPOSE 4173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4173 || exit 1

# Start the preview server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]