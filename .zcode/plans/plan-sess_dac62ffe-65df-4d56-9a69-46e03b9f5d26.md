# Kế hoạch: Tinh chỉnh project deploy lên Vercel (Neon PostgreSQL)

## Tổng quan vấn đề cốt lõi
Vercel là **serverless platform** — mỗi API route là một function độc lập, filesystem **không persistent**. Do đó:
- ❌ SQLite (file-based) **không hoạt động** — mỗi request file DB sẽ reset/bị thiếu
- ✅ Cần migrate sang **PostgreSQL** (Neon — serverless Postgres tối ưu cho Vercel)

## Lựa chọn đã chốt
- **DB Provider:** Neon (free tier 0.5GB, branch-able, tối ưu serverless)
- **Giữ Docker/Oracle Cloud** files song song (deploy 2 nơi được)
- **Có migration script** chuyển data SQLite → PostgreSQL

---

## Các bước triển khai

### 1. Cập nhật `prisma/schema.prisma` — Đổi provider sang PostgreSQL
```prisma
datasource db {
  provider = "postgresql"   // đổi từ "sqlite"
  url      = env("DATABASE_URL")
}
```
**Lý do:** Prisma generate code khác nhau cho sqlite vs postgresql. Không thể dùng cùng 1 client.

### 2. Tạo Prisma migration chính thức
- Chạy `prisma migrate dev --name init` để tạo `prisma/migrations/` folder
- **Lý do cần:** Trên serverless, `prisma db push` không tin cậy vì cold start. Migration chính thức đảm bảo schema được apply khi deploy.
- Tạo file `prisma/migrations/0_init/migration.sql` (nếu cần manual)

### 3. Sửa seed data cho tương thích PostgreSQL
- Đọc lại `src/app/api/seed/route.ts` — schema hiện tại nên tương thích (dùng String, Int, DateTime)
- Có thể có vấn đề với `DateTime` — SQLite linh hoạt hơn PostgreSQL về format ngày tháng
- Kiểm tra: `birthDate String?`, `createdAt DateTime @default(now())` → OK
- Cần đảm bảo các field `date` trong Attendance/Schedule dùng định dạng ISO nhất quán

### 4. Cập nhật `.env` cho cả 2 môi trường
```
# Local dev (Neon connection string)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Production (Vercel) — set trong Vercel dashboard
DATABASE_URL="postgresql://..."
```

### 5. Tạo migration script SQLite → PostgreSQL
File mới: `scripts/migrate-sqlite-to-postgres.ts`
- Đọc toàn bộ data từ `db/custom.db` (SQLite)
- Insert vào PostgreSQL qua Prisma
- Kèm duplicate check (dùng upsert)
- Bao gồm: students, classes, schedules, attendance, evaluations, bills, users, prospects, settings

### 6. Tạo `vercel.json` — cấu hình Vercel
```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install"
}
```

### 7. Tạo file `.env.vercel.example` — hướng dẫn setup Vercel
Liệt kê các biến env cần set trong Vercel Dashboard:
- `DATABASE_URL` (Neon connection string)
- `NEXT_PUBLIC_AUTO_SEED` = "false"

### 8. Sửa `package.json` — thêm scripts Vercel/Prisma
```json
"build": "prisma generate && next build",
"postinstall": "prisma generate"
```
**Lý do cần `postinstall`:** Vercel chạy `npm install` khi build → cần `prisma generate` chạy sau đó để có client.

### 9. Tạo `DEPLOY-VERCEL.md` — hướng dẫn tiếng Việt
Bước-by-bước:
1. Tạo tài khoản Neon → tạo project → copy connection string
2. Tạo tài khoản Vercel → import GitHub repo
3. Set environment variables trong Vercel
4. Deploy → chạy migration/seed
5. Chạy migration script (nếu cần import data cũ)

### 10. Cập nhật `next.config.ts` & `src/lib/db.ts`
- Giữ nguyên (đã OK cho serverless)
- **Lý do:** Prisma client đã được thiết kế để work với serverless. Không cần connection pooling thủ công vì Neon tự xử lý.

### 11. Tạo Prisma Data Seeder script độc lập
File: `scripts/seed-prod.ts` — chạy seed ngoài app
**Lý do:** Trên Vercel không có filesystem, không chạy `fetch('/api/seed')` được. Cần script chạy qua CLI: `npx tsx scripts/seed-prod.ts`

---

## Files sẽ tạo/sửa

| File | Hành động |
|---|---|
| `prisma/schema.prisma` | Sửa: `provider = "postgresql"` |
| `prisma/migrations/` | Tạo: migration SQL init |
| `src/app/api/seed/route.ts` | Sửa: đảm bảo tương thích Postgres |
| `.env` | Sửa: thêm Neon connection string (placeholder) |
| `.env.vercel.example` | **Tạo mới** |
| `vercel.json` | **Tạo mới** |
| `package.json` | Sửa: thêm postinstall + build script |
| `scripts/migrate-sqlite-to-postgres.ts` | **Tạo mới** |
| `scripts/seed-prod.ts` | **Tạo mới** |
| `DEPLOY-VERCEL.md` | **Tạo mới** (hướng dẫn tiếng Việt) |

## Giữ nguyên (không sửa)
- `Dockerfile`, `docker-compose.yml`, `DEPLOY.md` — vẫn dùng cho Oracle Cloud (PostgreSQL cũng chạy được)
- `src/app/page.tsx`, `src/app/api/*/route.ts` — logic API không đổi (Prisma API nhất quán giữa SQLite/Postgres)

## Lưu ý quan trọng
- **Prisma client phải được regenerate** khi đổi provider (sqlite → postgresql)
- **`postinstall` script rất quan trọng** — không có nó Vercel build sẽ fail vì thiếu Prisma client
- **Neon connection string cần `?sslmode=require`** — Vercel yêu cầu SSL
- **Có thể phải chạy migration script thủ công** lần đầu (không có DB để migrate tự động)
- **Vercel Hobby tier**: 100GB-hours serverless function execution/tháng — đủ dư cho project này
- **Kích hoạt Neon "Auto-suspend"**: free tier pause DB sau inactivity, warm-up mất ~1s
- **Lỗi Neon cold start**: nếu app "chậm" lần đầu truy cập → đó là Neon wake up, không phải lỗi code