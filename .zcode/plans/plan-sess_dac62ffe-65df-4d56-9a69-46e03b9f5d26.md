# Kế hoạch: Tối ưu hóa Project MsMyenEnglish cho Oracle Cloud Deploy

## Tổng quan phân tích hiện trạng

**Vấn đề cần khắc phục trước khi deploy:**
1. 🔴 **Auto-seed khi load trang** — `page.tsx:179-181` gọi `POST /api/seed` mỗi lần mount → phải bỏ/guard bằng biến môi trường
2. 🔴 **Mật khẩu plain-text** trong seed & login (`admin123`, `teacher123`) → cần băm bằng bcryptjs
3. 🔴 **DATABASE_URL hardcode** trong `.env` trỏ tới `/home/z/my-project/...` (path của Z.ai cloud) → cần dùng biến môi trường + relative path
4. 🟡 **Prisma log query** (`src/lib/db.ts:10`) → spam log production, cần tắt
5. 🟡 **Không có file deploy** nào (Dockerfile, docker-compose, .dockerignore)
6. 🟡 **`next.config.ts`** chưa set header bảo mật, cache, compression

## Plan triển khai (3 phần)

---

### PHẦN A: Tối ưu code cho production

**1. `src/app/page.tsx`** — Bỏ auto-seed, guard bằng env
```tsx
useEffect(() => {
  if (process.env.NEXT_PUBLIC_AUTO_SEED === 'true') {
    fetch('/api/seed', { method: 'POST' }).catch(() => {});
  }
}, []);
```

**2. `.env` + `.env.example`** — Tách biến môi trường
- `.env`: `DATABASE_URL="file:./db/custom.db"` (relative path, chạy được mọi nơi)
- `.env.example`: mẫu cho user
- `src/lib/db.ts`: bỏ `log: ['query']`

**3. Bảo mật mật khẩu (bcrypt)** — Tối thiểu như đã chọn
- Thêm `bcryptjs` vào dependencies
- `src/app/api/seed/route.ts`: băm password khi seed (`await bcrypt.hash(...)`)
- `src/app/api/login/route.ts`: so sánh bằng `bcrypt.compare`
- `src/app/api/users/route.ts`: băm password khi tạo/cập nhật user
- **Migration**: tạo script `scripts/hash-existing-passwords.ts` băm lại toàn bộ password hiện có trong DB

**4. `next.config.ts`** — Thêm cấu hình production
- `compress: true`, security headers (X-Frame-Options, X-Content-Type-Options, v.v.)
- Giữ `output: 'standalone'`, `reactStrictMode` bật lại

---

### PHẦN B: Docker hóa (Docker Compose)

**5. `Dockerfile`** — Multi-stage build tối ưu cho ARM64 (Oracle Ampere)
- **Stage 1 (base)**: `oven/bun:latest` làm base, cài `openssl` + `prisma` engines
- **Stage 2 (deps)**: Copy `package.json` + `bun.lock`, `bun install --frozen-lockfile`
- **Stage 3 (builder)**: Copy source, chạy `prisma generate` + `next build` (output standalone)
- **Stage 4 (runner)**: Image tối thiểu, chỉ copy `.next/standalone`, `.next/static`, `public`, `prisma/schema.prisma`, `db/`, `node_modules/.prisma`. Expose port 3000.

**6. `docker-compose.yml`** — Dễ deploy
```yaml
services:
  app:
    build: .
    container_name: msmyen-app
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data    # SQLite DB persistent
    environment:
      - DATABASE_URL=file:/app/data/custom.db
      - NODE_ENV=production
    restart: unless-stopped
```

**7. `.dockerignore`** — Loại bỏ `node_modules`, `.next`, `*.png`, `upload/`, `tool-results/`, `.git`, v.v.

**8. `prisma/schema.prisma`** — Cập nhật datasource để nhận env `DATABASE_URL` linh hoạt (đã có rồi, chỉ cần đảm bảo `.env` đúng)

---

### PHẦN C: Hướng dẫn deploy Oracle Cloud (Tiếng Việt)

**9. `DEPLOY.md`** — Hướng dẫn chi tiết từng bước:
1. **Tạo Oracle Cloud account** + Always Free VM (VM.Standard.A1.Flex ARM, 4 OCPU/24GB)
2. **Cấu hình Ingress Rules** (mở port 80/443/3000 trong VCN Security List)
3. **SSH vào VM**, cài Docker + Docker Compose
4. **Transfer code** lên VM (git clone hoặc scp)
5. **Build & Run**: `docker compose up -d --build`
6. **Cài Caddy reverse proxy** (HTTPS tự động với Let's Encrypt) hoặc Nginx
7. **Cấu hình domain** (optional, trỏ A record về IP VM)
8. **Backup DB**: cron job `sqlite3 .backup`
9. **Troubleshooting** các lỗi thường gặp

**10. Cập nhật `.gitignore`** — Thêm `data/`, `dev.log`, `server.log`

---

## Files sẽ tạo/sửa

| File | Hành động |
|---|---|
| `src/app/page.tsx` | Sửa (bỏ auto-seed) |
| `src/lib/db.ts` | Sửa (bỏ query log) |
| `.env` | Sửa (relative path) |
| `src/app/api/seed/route.ts` | Sửa (bcrypt) |
| `src/app/api/login/route.ts` | Sửa (bcrypt) |
| `src/app/api/users/route.ts` | Sửa (bcrypt) |
| `package.json` | Sửa (thêm bcryptjs + script hash) |
| `next.config.ts` | Sửa (security headers) |
| `.env.example` | **Tạo mới** |
| `.dockerignore` | **Tạo mới** |
| `Dockerfile` | **Tạo mới** |
| `docker-compose.yml` | **Tạo mới** |
| `scripts/hash-existing-passwords.ts` | **Tạo mới** |
| `DEPLOY.md` | **Tạo mới** (hướng dẫn tiếng Việt) |
| `.gitignore` | Sửa (thêm data/) |

## Lưu ý quan trọng
- **Không thêm auth middleware** (giữ nguyên luồng đăng nhập hiện tại theo lựa chọn "Tối thiểu")
- **Vẫn dùng SQLite** (phù hợp quy mô trung tâm tiếng Anh nhỏ-vừa, đơn giản, không cần DB server riêng)
- **Bun runtime** trong Docker (nhẹ hơn Node, build nhanh)
- Tương thích **ARM64** (Oracle Always Free Ampere)