/**
 * Script: Migrate dữ liệu từ SQLite sang PostgreSQL (Neon)
 *
 * Mục đích: Chuyển toàn bộ dữ liệu test/thật từ SQLite (db/custom.db)
 *           sang PostgreSQL (Neon hoặc bất kỳ Postgres nào).
 *
 * Cách chạy:
 *   1. Đảm bảo DATABASE_URL trong .env trỏ tới PostgreSQL đích
 *   2. Đảm bảo đã chạy `npx prisma db push` hoặc `prisma migrate deploy`
 *      để tạo schema trên Postgres
 *   3. Chạy: npm run migrate-data
 *
 * Logic:
 *   - Đọc SQLite qua better-sqlite3 (không qua Prisma để tránh conflict provider)
 *   - Insert vào Postgres qua Prisma (provider postgresql)
 *   - Dùng upsert để tránh trùng lặp khi chạy nhiều lần
 */
import Database from 'better-sqlite3';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const SQLITE_PATH = path.resolve(process.cwd(), 'db', 'custom.db');

// Prisma client → kết nối PostgreSQL (theo DATABASE_URL trong .env)
const pg = new PrismaClient();

async function main() {
  console.log('🚀 Bắt đầu migrate SQLite → PostgreSQL...\n');

  // Mở SQLite
  let sqlite: Database.Database;
  try {
    sqlite = new Database(SQLITE_PATH, { readonly: true });
    console.log(`✅ Đã mở SQLite: ${SQLITE_PATH}`);
  } catch (err) {
    console.error(`❌ Không mở được SQLite tại ${SQLITE_PATH}`);
    console.error('   Nếu bạn chưa có data cũ, hãy dùng `npm run seed-prod` thay thế.');
    process.exit(1);
  }

  // Helper: đọc tất cả row từ 1 table SQLite
  const readAll = (table: string): any[] => {
    try {
      return sqlite.prepare(`SELECT * FROM ${table}`).all();
    } catch {
      console.warn(`  ⚠️  Table "${table}" không tồn tại trong SQLite, bỏ qua.`);
      return [];
    }
  };

  // 1. Users
  const users = readAll('users');
  console.log(`📋 Users: ${users.length} records`);
  for (const u of users) {
    await pg.user.upsert({
      where: { userId: u.user_id },
      create: {
        userId: u.user_id,
        username: u.username,
        password: u.password,
        fullName: u.full_name,
        role: u.role,
        email: u.email,
        phone: u.phone,
        status: u.status,
      },
      update: {},
    });
  }

  // 2. Classes
  const classes = readAll('classes');
  console.log(`📋 Classes: ${classes.length} records`);
  for (const c of classes) {
    await pg.class.upsert({
      where: { classId: c.class_id },
      create: {
        classId: c.class_id,
        name: c.name,
        level: c.level,
        teacher: c.teacher,
        maxStudents: c.max_students,
        feePerSession: c.fee_per_session,
        note: c.note,
      },
      update: {},
    });
  }

  // 3. Students
  const students = readAll('students');
  console.log(`📋 Students: ${students.length} records`);
  for (const s of students) {
    await pg.student.upsert({
      where: { studentId: s.student_id },
      create: {
        studentId: s.student_id,
        name: s.name,
        birthDate: s.birth_date,
        gender: s.gender,
        phone: s.phone,
        parentZalo: s.parent_zalo,
        address: s.address,
        className: s.class_name,
        registerDate: s.register_date,
        note: s.note,
        status: s.status,
      },
      update: {},
    });
  }

  // 4. Schedules
  const schedules = readAll('schedules');
  console.log(`📋 Schedules: ${schedules.length} records`);
  for (const s of schedules) {
    await pg.schedule.upsert({
      where: { scheduleId: s.schedule_id },
      create: {
        scheduleId: s.schedule_id,
        className: s.class_name,
        date: s.date,
        dayOfWeek: s.day_of_week,
        startTime: s.start_time,
        endTime: s.end_time,
        room: s.room,
        teacher: s.teacher,
        status: s.status,
      },
      update: {},
    });
  }

  // 5. Attendance
  const attendance = readAll('attendance');
  console.log(`📋 Attendance: ${attendance.length} records`);
  for (const a of attendance) {
    await pg.attendance.upsert({
      where: { attendanceId: a.attendance_id },
      create: {
        attendanceId: a.attendance_id,
        studentId: a.student_id,
        className: a.class_name,
        date: a.date,
        dayOfWeek: a.day_of_week,
        status: a.status,
        note: a.note,
        checkedAt: a.checked_at,
      },
      update: {},
    });
  }

  // 6. Evaluations
  const evaluations = readAll('evaluations');
  console.log(`📋 Evaluations: ${evaluations.length} records`);
  for (const e of evaluations) {
    await pg.evaluation.upsert({
      where: { evaluationId: e.evaluation_id },
      create: {
        evaluationId: e.evaluation_id,
        studentId: e.student_id,
        studentName: e.student_name,
        className: e.class_name,
        month: e.month,
        note: e.note,
      },
      update: {},
    });
  }

  // 7. Prospects
  const prospects = readAll('prospects');
  console.log(`📋 Prospects: ${prospects.length} records`);
  for (const p of prospects) {
    await pg.prospect.upsert({
      where: { prospectId: p.prospect_id },
      create: {
        prospectId: p.prospect_id,
        contactDate: p.contact_date,
        parentZalo: p.parent_zalo,
        phone: p.phone,
        studentName: p.student_name,
        gender: p.gender,
        gradeAge: p.grade_age,
        desiredTime: p.desired_time,
        testStatus: p.test_status,
        suggestedClass: p.suggested_class,
        note: p.note,
        status: p.status,
        linkedStudentId: p.linked_student_id,
      },
      update: {},
    });
  }

  // 8. Bills
  const bills = readAll('bills');
  console.log(`📋 Bills: ${bills.length} records`);
  for (const b of bills) {
    await pg.bill.upsert({
      where: { billId: b.bill_id },
      create: {
        billId: b.bill_id,
        studentId: b.student_id,
        studentName: b.student_name,
        className: b.class_name,
        month: b.month,
        sessions: b.sessions,
        amount: b.amount,
        paid: b.paid,
        payDate: b.pay_date,
        status: b.status,
      },
      update: {},
    });
  }

  // 9. Settings
  const settings = readAll('settings');
  console.log(`📋 Settings: ${settings.length} records`);
  for (const s of settings) {
    await pg.setting.upsert({
      where: { key: s.key },
      create: {
        key: s.key,
        value: s.value,
      },
      update: {},
    });
  }

  sqlite.close();
  console.log('\n✅ Migrate hoàn tất!');
  console.log('   Kiểm tra dữ liệu tại: Neon Dashboard hoặc dùng `npx prisma studio`');
}

main()
  .then(() => process.exit(0))
  .catch(async (err) => {
    console.error('\n❌ Lỗi trong quá trình migrate:', err);
    await pg.$disconnect();
    process.exit(1);
  });
