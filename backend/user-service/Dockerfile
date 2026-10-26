# Build from the repo root, which holds the workspaces lockfile:
#   docker build -f backend/user-service/Dockerfile .

# ================================
# Stage 1: Dependencies
# ================================
FROM node:22-alpine AS deps
WORKDIR /app

# npm ci checks the lockfile against every workspace manifest, so all three are copied
COPY package.json package-lock.json ./
COPY backend/user-service/package.json backend/user-service/
COPY backend/course-service/package.json backend/course-service/
COPY frontend/package.json frontend/

# Install this service's production dependencies, exactly as pinned in the root package-lock.json.
# Shared versions land in /app/node_modules and service-specific ones in the service's own node_modules.
RUN npm ci --workspace backend/user-service --omit=dev --no-audit --no-fund && \
    mkdir -p backend/user-service/node_modules && \
    npm cache clean --force

# ================================
# Stage 2: Production Runner
# ================================
FROM node:22-alpine AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Copy production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/user-service/node_modules ./backend/user-service/node_modules

# Copy application code
COPY backend/user-service/package.json ./backend/user-service/
COPY backend/user-service/src ./backend/user-service/src

# Give the runtime user ownership of the app directory
RUN chown -R appuser:nodejs /app

# Switch to non-root user
USER appuser
WORKDIR /app/backend/user-service

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5000) + '/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

# Start the application
CMD ["node", "src/index.js"]
