# Production Dockerfile for HVACOps Next.js Application

# Stage 1: Dependencies
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat openssl openssl-dev libssl3

WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat openssl openssl-dev

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma client
RUN npx prisma generate

# Build Next.js app
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner

RUN apk add --no-cache dumb-init openssl libssl3

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy package and config
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Copy public folder (with fallback)
COPY --from=builder /app/public ./public 2>/dev/null || true

# Copy Prisma files
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "const http=require('http'); const opts={host:'localhost',port:3000,path:'/api/health',timeout:3000}; const req=http.request(opts,(res)=>{process.exit(res.statusCode===200?0:1)}); req.on('error',()=>process.exit(1)); req.end()"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
