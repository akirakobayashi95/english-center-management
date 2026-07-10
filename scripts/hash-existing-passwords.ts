/**
 * Script: Hash toàn bộ mật khẩu plain-text hiện có trong DB
 *
 * Mục đích: Chạy MỘT LẦN khi nâng cấp từ phiên bản cũ (mật khẩu plain-text)
 *           lên phiên bản mới (mật khẩu băm bằng bcrypt).
 *
 * Cách chạy:
 *   bun run scripts/hash-existing-passwords.ts
 *   hoặc: npx tsx scripts/hash-existing-passwords.ts
 *
 * Logic:
 *   - Đọc tất cả user trong DB
 *   - Nếu mật khẩu KHÔNG phải là hash bcrypt (không bắt đầu bằng "$2")  → băm lại
 *   - Nếu đã là hash bcrypt rồi → bỏ qua
 */
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import path from 'path';

// Script chạy từ project root: `bun run scripts/hash-existing-passwords.ts`
const dbPath = path.resolve(process.cwd(), 'db', 'custom.db');
const db = new PrismaClient({
  datasources: { db: { url: `file:${dbPath}` } },
});

async function main() {
  console.log('🔍 Đang quét toàn bộ user để kiểm tra mật khẩu...\n');

  const users = await db.user.findMany();
  let hashedCount = 0;
  let skippedCount = 0;

  for (const user of users) {
    // Hash bcrypt luôn bắt đầu bằng "$2a$", "$2b$" hoặc "$2y$"
    const isAlreadyHashed = /^\$2[abxy]\$\d{2}\$/.test(user.password);

    if (isAlreadyHashed) {
      skippedCount++;
      continue;
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    hashedCount++;
    console.log(`  ✅ Đã băm mật khẩu cho user: ${user.username} (${user.userId})`);
  }

  console.log(`\n📊 Kết quả:`);
  console.log(`   - Đã băm: ${hashedCount} user`);
  console.log(`   - Đã bỏ qua (đã băm sẵn): ${skippedCount} user`);
  console.log(`   - Tổng cộng: ${users.length} user\n`);
}

main()
  .then(() => {
    console.log('✅ Hoàn tất!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Lỗi:', err);
    process.exit(1);
  });
