# Multi-stage Dockerfile for Next.js 15 app with SSR
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps and tools needed for Prisma
RUN apk add --no-cache openssl libc6-compat
COPY package.json package-lock.json ./
# Prisma's postinstall (prisma generate) needs the schema present during npm ci
COPY prisma ./prisma
RUN npm ci

# Copy source and build
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install runtime dependencies
RUN apk add --no-cache openssl libc6-compat && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["sh", "-c", "npx prisma generate && node server.js"]
