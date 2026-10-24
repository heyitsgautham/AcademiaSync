# ================================
# Stage 1: Dependencies
# ================================
FROM node:22-alpine AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies, exactly as pinned in package-lock.json
RUN npm ci --omit=dev && \
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

# Copy application code
COPY . .

# Give the runtime user ownership of the app directory
RUN chown -R appuser:nodejs /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5000) + '/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

# Start the application
CMD ["node", "src/index.js"]
