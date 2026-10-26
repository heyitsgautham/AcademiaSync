# Build from the repo root, which holds the workspaces lockfile:
#   docker build -f frontend/Dockerfile .

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

# Install the frontend's dependencies, including devDependencies for the build, from the root lockfile
RUN npm ci --workspace frontend --no-audit --no-fund && \
    mkdir -p frontend/node_modules

# ================================
# Stage 2: Builder
# ================================
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY package.json package-lock.json ./

# Copy application source
COPY frontend ./frontend

# Set environment to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application; standalone output traces from the repo root
RUN npm run build --workspace frontend

# ================================
# Stage 3: Production Runner
# ================================
FROM node:22-alpine AS runner
WORKDIR /app

# Set environment to production; listen on every interface inside the container
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# The standalone build puts the server at frontend/server.js with the traced node_modules beside it
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder /app/frontend/public ./frontend/public

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start the application in production mode
CMD ["node", "frontend/server.js"]
