## Multi-stage Dockerfile for Next.js (standalone output)
## Uses npm (project has package-lock.json)

# Base image
FROM node:20-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies layer
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
# Clean install to leverage lockfile and caching
RUN npm ci

# Build layer
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Provide API_URL at build time for next.config rewrites
ARG API_URL
ENV API_URL=${API_URL}
# Prevent Node OOM during Next build on smaller builders
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build

# Runtime image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0
ENV HOSTNAME=0.0.0.0
ENV NODE_OPTIONS=--max-old-space-size=2048

# Non-root user for security
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy necessary artifacts from build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 8080
CMD ["node", "server.js"]

