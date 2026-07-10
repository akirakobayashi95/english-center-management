# 🚀 Hướng dẫn Deploy MsMyenEnglish lên Oracle Cloud

Hướng dẫn từng bước dành cho người mới — từ tạo tài khoản Oracle Cloud đến đưa website lên mạng với HTTPS.

> **Ghi chú nhanh (TL;DR)** — nếu đã có VM Oracle Cloud:
> ```bash
> # 1. SSH vào VM
> # 2. Cài Docker (xem Bước 4)
> # 3. Clone code + chạy:
> git clone <repo-url> msmyen && cd msmyen
> docker compose up -d --build
> # 4. Mở port 3000 trong Security List → truy cập http://<IP>:3000
> ```

---

## Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Tạo tài khoản Oracle Cloud & Always Free VM](#2-tạo-tài-khoản-oracle-cloud--always-free-vm)
3. [Cấu hình Firewall (mở port)](#3-cấu-hình-firewall-mở-port)
4. [SSH vào VM & cài Docker](#4-ssh-vào-vm--cài-docker)
5. [Deploy ứng dụng](#5-deploy-ứng-dụng)
6. [Cấu hình HTTPS với Caddy (Khuyến nghị)](#6-cấu-hình-https-với-caddy-khuyến-khích)
7. [Backup & Khôi phục Database](#7-backup--khôi-phục-database)
8. [Cập nhật ứng dụng](#8-cập-nhật-ứng-dụng)
9. [Xử lý sự cố (Troubleshooting)](#9-xử-lý-sự-cố-troubleshooting)

---

## 1. Tổng quan kiến trúc

```
Internet ──► Oracle Cloud VM (ARM Ampere A1, Always Free)
                │
                ├─ Port 80/443 ──► Caddy (Reverse Proxy + HTTPS tự động)
                │                    │
                │                    └─► Port 3000 ──► Docker Container (Next.js + Bun)
                │                                         │
                │                                         └─► SQLite (/app/data/custom.db)
                │
                └─ Volume: ./data/ (persistent DB storage)
```

**Lợi ích:**
- **Miễn phí mãi mãi** (Always Free tier: 4 OCPU + 24GB RAM ARM)
- **HTTPS tự động** qua Caddy + Let's Encrypt
- **Backup dễ dàng** — chỉ cần copy file `data/custom.db`

---

## 2. Tạo tài khoản Oracle Cloud & Always Free VM

### 2.1. Đăng ký tài khoản
1. Truy cập **https://www.oracle.com/cloud/free/**
2. Bấm **"Start for free"** và đăng ký
3. Cần: email, số điện thoại (xác thực SMS), thẻ tín dụng (không bị trừ tiền, chỉ xác minh)
4. Chọn **Home Region** gần Việt Nam: **Singapore** hoặc **Tokyo** (độ trễ thấp nhất)

### 2.2. Tạo VM (Compute Instance)
1. Vào **Oracle Cloud Console** → menu ☰ → **Compute** → **Instances**
2. Bấm **"Create instance"**
3. Cấu hình:
   - **Name:** `msmyen-server`
   - **Image:** `Canonical Ubuntu 22.04` (hoặc 24.04)
   - **Shape:** Bấm **"Edit"** → chọn **Ampere** → `VM.Standard.A1.Flex`
     - OCPUs: **4** · Memory: **24 GB** (tối đa Always Free)
   - **Networking:** Giữ mặc định (tự tạo VCN)
   - **Add SSH keys:** ⚠️ **QUAN TRỌNG**
     - Chọn **"Save private key"** và **"Save public key"**
     - Lưu file `.key` vào máy — **KHÔNG được mất**, không có cách lấy lại!
4. Bấm **"Create"** — đợi ~2 phút để VM khởi động

### 2.3. Ghi lại IP công khai
- Vào trang detail của instance → copy **Public IP Address** (vd: `138.3.x.x`)

---

## 3. Cấu hình Firewall (mở port)

Oracle Cloud có **2 lớp firewall** — phải mở cả hai:

### 3.1. Security List (lớp VCN)
1. Menu ☰ → **Networking** → **Virtual Cloud Networks**
2. Click vào VCN của bạn → **Security Lists** → click Default Security List
3. Bấm **"Add Ingress Rules"** và thêm lần lượt:

| Source CIDR | IP Protocol | Destination Port | Mô tả |
|---|---|---|---|
| `0.0.0.0/0` | TCP | `80` | HTTP |
| `0.0.0.0/0` | TCP | `443` | HTTPS |
| `0.0.0.0/0` | TCP | `22` | SSH |
| `0.0.0.0/0` | TCP | `3000` | Next.js (tạm thời, test) |

### 3.2. OS Firewall (iptables trong VM)
Sẽ mở bằng lệnh sau khi SSH vào (xem Bước 4.3).

---

## 4. SSH vào VM & cài Docker

### 4.1. SSH vào VM
```bash
# Phân quyền cho private key
chmod 400 ~/Downloads/ssh-key-*.key

# SSH vào (thay IP bằng Public IP của bạn)
ssh -i ~/Downloads/ssh-key-*.key ubuntu@<PUBLIC_IP>
```

### 4.2. Mở port ở OS firewall
```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT
# Lưu để khỏi mất khi reboot
sudo netfilter-persistent save
```

### 4.3. Cài Docker + Docker Compose
```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài Docker
curl -fsSL https://get.docker.com | sudo sh

# Thêm user ubuntu vào group docker (không cần sudo mỗi lần)
sudo usermod -aG docker ubuntu

# Kích hoạt Docker
sudo systemctl enable docker
sudo systemctl start docker

# Đăng xuất rồi đăng nhập lại để group có hiệu lực
exit
```

SSH vào lại:
```bash
ssh -i ~/Downloads/ssh-key-*.key ubuntu@<PUBLIC_IP>

# Kiểm tra Docker đã chạy
docker --version
docker compose version
```

---

## 5. Deploy ứng dụng

### 5.1. Đưa code lên VM (chọn 1 trong 2 cách)

**Cách A: Git Clone (khuyến nghị)**
```bash
git clone https://github.com/<username>/<repo>.git msmyen
cd msmyen
```

**Cách B: Upload trực tiếp bằng SCP (từ máy cá nhân)**
```bash
# Trên máy cá nhân — nén project (bỏ node_modules)
cd C:\Users\Administrator\ZCodeProject
tar --exclude='node_modules' --exclude='.next' --exclude='data' -czf msmyen.tar.gz .

# Upload lên VM
scp -i ~/Downloads/ssh-key-*.key msmyen.tar.gz ubuntu@<PUBLIC_IP>:~/

# SSH vào VM và giải nén
ssh -i ~/Downloads/ssh-key-*.key ubuntu@<PUBLIC_IP>
mkdir -p msmyen && tar -xzf msmyen.tar.gz -C msmyen && cd msmyen
```

### 5.2. Build & Chạy
```bash
cd ~/msmyen

# Tạo thư mục data để mount volume
mkdir -p data

# Copy DB mẫu vào data/ (lần đầu tiên)
cp db/custom.db data/custom.db

# Build image và chạy container (chờ ~3-5 phút lần đầu)
docker compose up -d --build
```

### 5.3. Kiểm tra
```bash
# Xem container đang chạy
docker compose ps

# Xem log (Ctrl+C để thoát)
docker compose logs -f
```

Mở trình duyệt: **`http://<PUBLIC_IP>:3000`**

Đăng nhập với tài khoản mặc định:
- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Sau khi đăng nhập lần đầu, hãy đổi mật khẩu ngay ở mục "Người dùng"!**

---

## 6. Cấu hình HTTPS với Caddy (Khuyến nghị)

Để dùng tên miền + HTTPS (vd: `https://english.miyendomain.com`) thay vì `http://<IP>:3000`.

### 6.1. Trỏ domain về VM
- Vào trang quản lý domain → thêm **A Record**:
  - **Name:** `@` hoặc `english` (subdomain)
  - **Value:** `<PUBLIC_IP>` của VM
  - **TTL:** 300

### 6.2. Cài Caddy trên VM
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

### 6.3. Cấu hình Caddy
```bash
sudo nano /etc/caddy/Caddyfile
```

Thay toàn bộ nội dung bằng:
```
english.miyendomain.com {
    reverse_proxy localhost:3000
}
```
*(Thay `english.miyendomain.com` bằng domain thật của bạn)*

Khởi động lại Caddy:
```bash
sudo systemctl restart caddy
sudo systemctl enable caddy
```

Caddy sẽ **tự động xin chứng chỉ SSL** từ Let's Encrypt. Đợi ~1 phút rồi truy cập:
**`https://english.miyendomain.com`** ✨

### 6.4. (Optional) Đóng port 3000 sau khi có Caddy
```bash
sudo iptables -D INPUT -m state --state NEW -p tcp --dport 3000 -j ACCEPT 2>/dev/null
sudo netfilter-persistent save
```
Chỉ mở lại khi cần debug trực tiếp.

---

## 7. Backup & Khôi phục Database

### 7.1. Backup thủ công
```bash
# Trong VM — tạo bản sao DB
cp ~/msmyen/data/custom.db ~/backup-custom-$(date +%Y%m%d).db
```

### 7.2. Backup tự động (cron mỗi ngày lúc 3h sáng)
```bash
crontab -e
```
Thêm dòng:
```
0 3 * * * cp /home/ubuntu/msmyen/data/custom.db /home/ubuntu/backups/custom-$(date +\%Y\%m\%d).db && find /home/ubuntu/backups/ -mtime +30 -delete
```
*(Tự động xóa bản backup cũ hơn 30 ngày)*

### 7.3. Tải backup về máy cá nhân
```bash
scp -i ~/Downloads/ssh-key-*.key ubuntu@<PUBLIC_IP>:~/backup-custom-*.db ~/Downloads/
```

### 7.4. Khôi phục
```bash
# Dừng app
cd ~/msmyen && docker compose down

# Đè DB cũ bằng backup
cp ~/backup-custom-20260101.db ~/msmyen/data/custom.db

# Chạy lại
docker compose up -d
```

---

## 8. Cập nhật ứng dụng

Khi có code mới, deploy lại:

```bash
cd ~/msmyen

# Kéo code mới (nếu dùng Git)
git pull origin main

# Rebuild & restart
docker compose up -d --build

# (Nếu schema DB thay đổi) chạy Prisma migrate:
docker compose exec app bunx prisma db push
```

---

## 9. Xử lý sự cố (Troubleshooting)

### Không truy cập được `http://<IP>:3000`
1. Kiểm tra container đang chạy: `docker compose ps`
2. Kiểm tra log: `docker compose logs --tail 50`
3. Kiểm tra port đã mở:
   - Security List (Bước 3.1) có rule port 3000?
   - iptables (Bước 4.2) đã chạy?
4. Test trong VM: `curl http://localhost:3000` — nếu trả HTML thì app chạy, vấn đề ở firewall.

### Container liên tục restart
```bash
docker compose logs --tail 100
```
Thường là lỗi DB — kiểm tra:
```bash
ls -la ~/msmyen/data/custom.db   # File có tồn tại?
docker compose exec app ls -la /app/data/custom.db   # Container thấy được?
```

### Lỗi "Database is locked"
SQLite bị lock khi 2 tiến trình cùng ghi. Restart container:
```bash
docker compose restart
```

### Quên mật khẩu admin
Reset bằng cách chạy script hash trong container:
```bash
docker compose exec app bun run scripts/hash-existing-passwords.ts
```
Hoặc reset trực tiếp bằng DB:
```bash
docker compose exec app sqlite3 /app/data/custom.db \
  "UPDATE users SET password='\$2a\$10\$N9qo8uLOickgx2ZMRZoMy...hash...' WHERE username='admin';"
```

### Caddy không xin được SSL
- Kiểm tra domain đã trỏ đúng IP: `dig english.miyendomain.com`
- Đảm bảo port 80 và 443 đã mở (cả Security List và iptables)
- Xem log Caddy: `sudo journalctl -u caddy --no-pager | tail 50`

### Hết RAM / CPU
```bash
# Xem tài nguyên
docker stats
free -h
df -h

# Xóa image/cache cũ để giải phóng ổ đĩa
docker system prune -a --volumes
```

### Đổi region/timezone cho VM
```bash
sudo timedatectl set-timezone Asia/Ho_Chi_Minh
```

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra theo thứ tự:
1. `docker compose logs` — log ứng dụng
2. `sudo journalctl -u caddy` — log Caddy
3. Security List & iptables — port đã mở?
4. Domain DNS — đã trỏ đúng chưa?

---

**Tài khoản mặc định sau khi deploy:**
| Tài khoản | Mật khẩu | Vai trò |
|---|---|---|
| `admin` | `admin123` | Admin |
| `teacher1` | `teacher123` | Giáo viên |
| `teacher2` | `teacher123` | Giáo viên |

⚠️ **Đổi mật khẩu ngay sau lần đăng nhập đầu tiên!**
