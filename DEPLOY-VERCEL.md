# 🌐 Hướng dẫn Deploy MsMyenEnglish lên Vercel + Neon PostgreSQL

Hướng dẫn từng bước — từ tạo database, kết nối GitHub, đến đưa website lên mạng với HTTPS tự động.

> **TL;DR (nếu đã quen):**
> 1. Tạo Neon project → copy `DATABASE_URL`
> 2. Push code lên GitHub
> 3. Vercel: Import repo → set `DATABASE_URL` env → Deploy
> 4. Chạy `npx prisma migrate deploy` + `npm run seed-prod`

---

## Mục lục

1. [Tại sao cần PostgreSQL thay vì SQLite?](#1-tại-sao-cần-postgresql-thay-vì-sqlite)
2. [Tạo Database Neon (PostgreSQL)](#2-tạo-database-neon-postgresql)
3. [Push code lên GitHub](#3-push-code-lên-github)
4. [Deploy trên Vercel](#4-deploy-trên-vercel)
5. [Khởi tạo dữ liệu (Migrate hoặc Seed)](#5-khởi-tạo-dữ-liệu-migrate-hoặc-seed)
6. [Kiểm tra & Đổi mật khẩu](#6-kiểm-tra--đổi-mật-khẩu)
7. [Cập nhật ứng dụng](#7-cập-nhật-ứng-dụng)
8. [Backup Database Neon](#8-backup-database-neon)
9. [Xử lý sự cố](#9-xử-lý-sự-cố)

---

## 1. Tại sao cần PostgreSQL thay vì SQLite?

**Vercel là serverless platform** — mỗi request được xử lý bởi function độc lập, filesystem **không persistent** (bị reset sau mỗi request).

| | SQLite | PostgreSQL (Neon) |
|---|---|---|
| Lưu trữ | File `.db` trên disk | Server database |
| Vercel compatible | ❌ Không | ✅ Có |
| Free tier | N/A | 0.5GB storage |
| Connection | File path | Connection string |

**Neon** được chọn vì:
- ✅ Serverless Postgres tối ưu cho Vercel
- ✅ Free tier hào phóng (0.5GB, đủ cho trung tâm tiếng Anh)
- ✅ Auto-suspend tiết kiệm tài nguyên (wake-up ~1 giây)
- ✅ Branching (tạo DB test từ DB production)

---

## 2. Tạo Database Neon (PostgreSQL)

### 2.1. Đăng ký Neon
1. Truy cập **https://neon.tech**
2. Bấm **"Sign up"** → đăng nhập bằng GitHub hoặc Google
3. Tạo project mới:
   - **Project name:** `msmyen-english`
   - **Database name:** `msmyen`
   - **Region:** `AWS Asia Pacific (Singapore)` — gần VN nhất
   - **Postgres version:** 16 (mặc định)

### 2.2. Copy connection string
1. Vào trang Dashboard của project Neon
2. Tìm mục **"Connection string"** (hoặc "Connection Details")
3. Copy chuỗi có dạng:
   ```
   postgresql://user:password@ep-xxx.aws.neon.tech/msmyen?sslmode=require
   ```
4. **Lưu lại** — đây chính là `DATABASE_URL`

> ⚠️ **Đảm bảo connection string kết thúc bằng `?sslmode=require`** — Vercel bắt buộc SSL.

---

## 3. Push code lên GitHub

Nếu chưa push code lên GitHub, làm theo:

```bash
cd C:\Users\Administrator\ZCodeProject

# Commit các thay đổi Vercel
git add -A
git commit -m "feat: Add Vercel + Neon PostgreSQL support

- Change Prisma provider from sqlite to postgresql
- Add vercel.json, .env.vercel.example
- Add migration script (SQLite → Postgres)
- Add seed-prod script (CLI seed for serverless)
- Add postinstall script for Prisma generate
- Add DEPLOY-VERCEL.md guide"

# Push lên GitHub repo đã tạo
git push origin main
```

---

## 4. Deploy trên Vercel

### 4.1. Import project
1. Truy cập **https://vercel.com** → đăng nhập bằng GitHub
2. Bấm **"Add New..."** → **"Project"**
3. Tìm repo `english-center-management` → **"Import"**

### 4.2. Cấu hình Environment Variables
Trước khi bấm Deploy, mở **"Environment Variables"** và thêm:

| Name | Value | Environment |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@ep-xxx.neon.tech/msmyen?sslmode=require` | Production + Preview |
| `NEXT_PUBLIC_AUTO_SEED` | `false` | Production |

> ⚠️ **Quan trọng:** Dán đúng connection string Neon từ Bước 2.2

### 4.3. Deploy
- Bấm **"Deploy"** — đợi 2-3 phút
- Vercel sẽ chạy:
  1. `npm install` (tự động chạy `postinstall` → `prisma generate`)
  2. `npm run build:vercel` (prisma generate + next build)

⚠️ **Lần build đầu có thể FAIL** vì DB Neon chưa có bảng (chưa run migration).
→ Đây là **bình thường**, ta sẽ fix ở Bước 5.

---

## 5. Khởi tạo dữ liệu (Migrate hoặc Seed)

Sau khi Vercel deploy xong (dù build fail cũng được), cần khởi tạo DB Neon. Có 2 cách:

### Cách A: Chuyển data cũ từ SQLite (Khuyến nghị nếu có data test)

```bash
# Trên máy cá nhân — set DATABASE_URL tạm thời thành Neon
# Sửa .env: DATABASE_URL="postgresql://...neon.tech/msmyen?sslmode=require"

# 1. Tạo schema trên Neon
npx prisma db push

# 2. Migrate data từ SQLite
npm run migrate-data

# 3. Hoàn tất! Data đã ở Neon
```

### Cách B: Seed data mẫu (nếu bắt đầu từ đầu)

```bash
# Trên máy cá nhân — set DATABASE_URL = Neon connection string

# 1. Tạo schema trên Neon
npx prisma db push

# 2. Seed data mẫu
npm run seed-prod
```

### Cách C: Chạy qua Vercel CLI (nếu không muốn sửa .env local)

```bash
# Cài Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
cd C:\Users\Administrator\ZCodeProject
vercel link

# Pull env variables từ Vercel
vercel env pull .env.local

# Tạo schema
npx prisma db push

# Seed
npm run seed-prod
```

---

## 6. Kiểm tra & Đổi mật khẩu

### 6.1. Truy cập website
- Vào Vercel Dashboard → tab **"Deployments"** → click URL (vd: `english-center.vercel.app`)
- Đăng nhập:
  - **Username:** `admin`
  - **Password:** `admin123`

### 6.2. ⚠️ Đổi mật khẩu ngay!
1. Vào mục **"Người dùng"** → sửa admin
2. Đặt mật khẩu mới mạnh
3. Lưu

### 6.3. Redeploy (nếu build fail lần đầu)
Sau khi DB Neon đã có schema + data:
1. Vercel Dashboard → Deployments
2. Bấm **"..."** → **"Redeploy"** trên deployment mới nhất
3. Lần này build sẽ thành công ✅

---

## 7. Cập nhật ứng dụng

Khi sửa code và muốn deploy bản mới:

```bash
# 1. Commit code mới
git add -A
git commit -m "fix: ..."
git push origin main

# 2. Vercel TỰ ĐỘNG build + deploy (mỗi push lên main)
#    Xem tiến trình tại: Vercel Dashboard → Deployments
```

**Nếu schema Prisma thay đổi** (thêm/sửa bảng):
```bash
# Trên máy cá nhân (DATABASE_URL = Neon)
npx prisma db push
# Sau đó push code lên GitHub
```

---

## 8. Backup Database Neon

### 8.1. Backup qua Neon Dashboard
1. Vào Neon Dashboard → project
2. **"Branches"** → tạo branch mới (snapshot DB)
3. Đặt tên: `backup-2026-01-15`

### 8.2. Export bằng pg_dump
```bash
# Cài psql client (nếu chưa có)
# Windows: tải PostgreSQL từ https://postgresql.org/download/windows/

# Export
pg_dump "postgresql://user:pass@ep-xxx.neon.tech/msmyen?sslmode=require" \
  -F c -f backup-$(date +%Y%m%d).dump

# Restore
pg_restore -d "postgresql://..." backup-20260115.dump
```

---

## 9. Xử lý sự cố

### Build fail: "Prisma can't reach database server"
→ `DATABASE_URL` chưa set hoặc sai. Kiểm tra:
- Vercel Dashboard → Settings → Environment Variables
- Connection string kết thúc bằng `?sslmode=require`

### Lỗi: "Table does not exist"
→ Chưa run migration. Làm Bước 5.

### App tải chậm lần đầu (cold start)
→ Đây là **Neon auto-suspend** — DB sleep khi không dùng, wake-up mất ~1 giây.
- **Fix:** Neon Dashboard → Settings → tắt "Auto-suspend" (nhưng tốn compute hours)

### Lỗi: "Too many connections"
→ Serverless function mở quá nhiều connection. Fix:
- Neon tự xử lý connection pooling — không cần config thêm
- Nếu vẫn lỗi, dùng `pgBouncer` mode (Neon Dashboard → enable connection pooling)

### `prisma generate` không chạy khi build
→ Kiểm tra `package.json` có:
```json
"postinstall": "prisma generate"
```

### App trắng trang / 500 error
1. Vercel Dashboard → tab **"Logs"** (Runtime logs)
2. Xem error log chi tiết
3. Thường là `DATABASE_URL` sai hoặc DB chưa migrate

### Login không được (sai mật khẩu)
- Nếu seed mới: `admin / admin123`
- Nếu migrate từ SQLite: mật khẩu cũ được giữ nguyên
- Reset: chạy `npm run seed-prod` (sẽ skip nếu đã có data) hoặc xoá bảng users trong Neon rồi seed lại

---

## 📞 Hỗ trợ nhanh

| Vấn đề | Kiểm tra |
|---|---|
| Build fail | Vercel → Build Logs |
| Runtime error | Vercel → Functions → Logs |
| DB không connect | `.env` / Vercel env vars |
| Data thiếu | `npx prisma studio` để xem DB |
| Schema lỗi | `npx prisma db push` |

---

## 🆚 So sánh: Vercel vs Oracle Cloud

| | Vercel + Neon | Oracle Cloud + Docker |
|---|---|---|
| **Setup** | ⚡ 10 phút (GUI) | 🐢 30-60 phút (SSH) |
| **CI/CD** | ✅ Auto (git push) | ❌ Manual |
| **HTTPS** | ✅ Tự động | 🔧 Cần Caddy/Let's Encrypt |
| **Database** | Neon Postgres (serverless) | SQLite (local file) |
| **Custom domain** | ✅ Free | 🔧 Cần config Caddy |
| **Giới hạn free** | 100GB-hours/tháng | 4 OCPU + 24GB RAM mãi mãi |
| **Tốt cho** | Dev/demo, MVP | Production, nhiều user |

> 💡 **Khuyến nghị:** Dùng **Vercel** khi đang phát triển/test, chuyển sang **Oracle Cloud** khi có nhiều user thật (save cost).
