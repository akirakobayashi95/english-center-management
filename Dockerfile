# =============================================================================
# Dockerfile — MsMyenEnglish (Next.js + Prisma + SQLite)
# Tối ưu cho Oracle Cloud ARM64 (Ampere A1) và x86_64
# Multi-stage build để image cuối cùng nhỏ gọn nhất
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Dependencies — cài đặt node_modules (cache layer riêng)
# -----------------------------------------------------------------------------
FROM oven/bun:1.2 AS deps
WORKDIR /app

# Cài OpenSSL (Prisma cần) và curl cho healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy lock file và package.json trước để cache layer khi code thay đổi
COPY package.json bun.lock* package-lock.json* ./

# Cài dependencies (bao gồm devDependencies để build)
RUN bun install --frozen-lockfile || bun install

# -----------------------------------------------------------------------------
# Stage 2: Builder — generate Prisma client + build Next.js
# -----------------------------------------------------------------------------
FROM oven/bun:1.2 AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Tạo thư mục database (nếu chưa có) và sao chép DB mẫu
RUN mkdir -p /app/data
COPY db/custom.db* /app/data/ 2>/dev/null || true

# Generate Prisma client
ENV DATABASE_URL="file:/app/data/custom.db"
RUN bunx prisma generate

# Build Next.js (output: standalone)
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# -----------------------------------------------------------------------------
# Stage 3: Runner — image production tối giản, chỉ chứa những gì cần thiết
# -----------------------------------------------------------------------------
FROM oven/bun:1.2 AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Tạo user non-root để chạy app an toàn hơn
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

# Copy standalone build (đã bao gồm node_modules tối giản)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy Prisma schema + generated client (cần để runtime hoạt động)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Tạo thư mục data persistent (will be mounted as volume)
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

# Copy DB mẫu vào data/ nếu chưa có (lần đầu chạy)
COPY --from=builder --chown=nextjs:nodejs /app/db/custom.db* /app/data/ 2>/dev/null || true

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production
# SQLite path — khớp với volume mount trong docker-compose
ENV DATABASE_URL="file:/app/data/custom.db"

# Healthcheck đơn giản
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

CMD ["bun", "server.js"]
