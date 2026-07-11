/**
 * Script: Seed dữ liệu mẫu vào PostgreSQL (dùng cho production/Vercel)
 *
 * Mục đích: Trên Vercel serverless không chạy được fetch('/api/seed')
 *           Script này chạy trực tiếp qua CLI để seed data mẫu lần đầu.
 *
 * Cách chạy:
 *   1. Đảm bảo DATABASE_URL trong .env trỏ tới PostgreSQL (Neon)
 *   2. Đảm bảo đã chạy `npx prisma db push` để tạo schema
 *   3. Chạy: npm run seed-prod
 */
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu mẫu vào PostgreSQL...\n');

  // Kiểm tra đã có data chưa
  const existingUsers = await db.user.count();
  if (existingUsers > 0) {
    console.log(`ℹ️  DB đã có ${existingUsers} user — bỏ qua seed để tránh trùng lặp.`);
    console.log('   Nếu muốn seed lại, hãy reset DB trước: npm run db:reset');
    return;
  }

  // 1. Users (mật khẩu đã băm bcrypt)
  console.log('📋 Seeding Users...');
  const [adminPass, teacher1Pass, teacher2Pass] = await Promise.all([
    bcrypt.hash('admin123', 10),
    bcrypt.hash('teacher123', 10),
    bcrypt.hash('teacher123', 10),
  ]);
  await db.user.createMany({
    data: [
      { userId: 'U001', username: 'admin', password: adminPass, fullName: 'Nguyễn Quản Trị', role: 'Admin', email: 'admin@msmyen.edu.vn', phone: '0900000001', status: 'Active' },
      { userId: 'U002', username: 'teacher1', password: teacher1Pass, fullName: 'Cô Lê', role: 'Giáo viên', email: 'le@msmyen.edu.vn', phone: '0900000002', status: 'Active' },
      { userId: 'U003', username: 'teacher2', password: teacher2Pass, fullName: 'Thầy Minh', role: 'Giáo viên', email: 'minh@msmyen.edu.vn', phone: '0900000003', status: 'Active' },
    ],
  });

  // 2. Classes
  console.log('📋 Seeding Classes...');
  await db.class.createMany({
    data: [
      { classId: 'C001', name: 'English A1 - Beginner', level: 'Beginner', teacher: 'Cô Lan', maxStudents: 25, feePerSession: 150000 },
      { classId: 'C002', name: 'English A2 - Elementary', level: 'Elementary', teacher: 'Cô Lê', maxStudents: 25, feePerSession: 150000 },
      { classId: 'C003', name: 'English B1 - Intermediate', level: 'Intermediate', teacher: 'Thầy Minh', maxStudents: 25, feePerSession: 200000 },
      { classId: 'C004', name: 'English B2 - Upper Intermediate', level: 'Upper Intermediate', teacher: 'Thầy Minh', maxStudents: 25, feePerSession: 200000 },
      { classId: 'C005', name: 'English C1 - Advanced', level: 'Advanced', teacher: 'Thầy Hùng', maxStudents: 20, feePerSession: 250000 },
    ],
  });

  // 3. Students
  console.log('📋 Seeding Students...');
  const studentData = [
    { studentId: 'S001', name: 'Trần Thị Quỳnh', birthDate: '2005-03-15', gender: 'Nữ', phone: '0912345678', parentZalo: 'Mẹ quynh', address: 'Hà Nội', className: 'English A1 - Beginner', registerDate: '2024-09-01', status: 'Đang học' },
    { studentId: 'S002', name: 'Ngô Thu Hải', birthDate: '2006-01-20', gender: 'Nam', phone: '0912345679', parentZalo: 'Mẹ hai', address: 'Hà Nội', className: 'English A1 - Beginner', registerDate: '2024-09-01', status: 'Đang học' },
    { studentId: 'S003', name: 'Ngô Thu Dũng', birthDate: '2005-07-10', gender: 'Nam', phone: '0912345680', parentZalo: 'Mẹ dung', address: 'Hà Nội', className: 'English A1 - Beginner', registerDate: '2024-09-01', status: 'Đang học' },
    { studentId: 'S004', name: 'Đặng Phương Bảo', birthDate: '2005-11-25', gender: 'Nam', phone: '0912345681', parentZalo: 'Mẹ bao', address: 'Hà Nội', className: 'English A1 - Beginner', registerDate: '2024-09-01', status: 'Đang học' },
    { studentId: 'S005', name: 'Ngô Thu Linh', birthDate: '2006-04-08', gender: 'Nữ', phone: '0912345682', parentZalo: 'Mẹ linh', address: 'Hà Nội', className: 'English A1 - Beginner', registerDate: '2024-09-01', status: 'Đang học' },
    { studentId: 'S006', name: 'Ngô Thu Khoa', birthDate: '2005-09-12', gender: 'Nam', phone: '0912345683', parentZalo: 'Mẹ khoa', address: 'Hà Nội', className: 'English A1 - Beginner', registerDate: '2024-09-01', status: 'Đang học' },
    { studentId: 'S007', name: 'Hoàng Thanh Tùng', birthDate: '2006-02-28', gender: 'Nam', phone: '0912345684', parentZalo: 'Mẹ tung', address: 'Hà Nội', className: 'English A1 - Beginner', registerDate: '2024-09-01', status: 'Đang học' },
    { studentId: 'S008', name: 'Lê Hoàng Dũng', birthDate: '2005-05-18', gender: 'Nam', phone: '0923456789', parentZalo: 'Mẹ dung.lh', address: 'Hà Nội', className: 'English A2 - Elementary', registerDate: '2024-09-01', status: 'Đang học' },
    { studentId: 'S009', name: 'Ngô Thu Khoa TCB', birthDate: '2006-08-22', gender: 'Nam', phone: '0923456790', parentZalo: 'Mẹ khoa.nt', address: 'Hà Nội', className: 'English A2 - Elementary', registerDate: '2024-09-01', status: 'Đang học' },
    { studentId: 'S010', name: 'Hoàng Thanh Mai', birthDate: '2005-12-05', gender: 'Nữ', phone: '0923456791', parentZalo: 'Mẹ mai', address: 'Hà Nội', className: 'English A2 - Elementary', registerDate: '2024-09-01', status: 'Đang học' },
    { studentId: 'S011', name: 'Lê Hoàng Giang', birthDate: '2006-06-30', gender: 'Nữ', phone: '0923456792', parentZalo: 'Mẹ giang', address: 'Hà Nội', className: 'English A2 - Elementary', registerDate: '2024-09-01', status: 'Đang học' },
    { studentId: 'S012', name: 'Lê Hoàng Phong', birthDate: '2005-10-14', gender: 'Nam', phone: '0923456793', parentZalo: 'Mẹ phong', address: 'Hà Nội', className: 'English A2 - Elementary', registerDate: '2024-09-01', status: 'Đang học' },
    { studentId: 'S013', name: 'Đặng Phương Dũng', birthDate: '2006-03-25', gender: 'Nam', phone: '0923456794', parentZalo: 'Mẹ dung.dp', address: 'Hà Nội', className: 'English B1 - Intermediate', registerDate: '2024-09-01', status: 'Đang học' },
    { studentId: 'S014', name: 'Đặng Phương Hùng', birthDate: '2005-08-08', gender: 'Nam', phone: '0923456795', parentZalo: 'Mẹ hung', address: 'Hà Nội', className: 'English B1 - Intermediate', registerDate: '2024-09-01', status: 'Đang học' },
    { studentId: 'S015', name: 'Trần Thị Châu', birthDate: '2006-01-15', gender: 'Nữ', phone: '0923456796', parentZalo: 'Mẹ chau', address: 'Hà Nội', className: 'English B1 - Intermediate', registerDate: '2024-09-01', status: 'Đang học' },
    { studentId: 'S016', name: 'Trần Thị Mai', birthDate: '2005-04-20', gender: 'Nữ', phone: '0923456797', parentZalo: 'Mẹ mai.tt', address: 'Hà Nội', className: 'English B1 - Intermediate', registerDate: '2024-09-01', status: 'Đang học' },
    { studentId: 'S017', name: 'Đặng Phương Giang', birthDate: '2006-07-12', gender: 'Nữ', phone: '0923456798', parentZalo: 'Mẹ giang.dp', address: 'Hà Nội', className: 'English B2 - Upper Intermediate', registerDate: '2024-09-01', status: 'Đang học' },
    { studentId: 'S018', name: 'Đặng Phương Hùng TA', birthDate: '2005-11-30', gender: 'Nam', phone: '0923456799', parentZalo: 'Mẹ hung.dp', address: 'Hà Nội', className: 'English B2 - Upper Intermediate', registerDate: '2024-09-01', status: 'Đang học' },
    { studentId: 'S019', name: 'Đặng Phương Linh', birthDate: '2006-02-18', gender: 'Nữ', phone: '0923456800', parentZalo: 'Mẹ linh.dp', address: 'Hà Nội', className: 'English B2 - Upper Intermediate', registerDate: '2024-09-01', status: 'Đang học' },
    { studentId: 'S020', name: 'Phạm Minh Phong', birthDate: '2005-09-22', gender: 'Nam', phone: '0923456801', parentZalo: 'Mẹ phong.pm', address: 'Hà Nội', className: 'English B2 - Upper Intermediate', registerDate: '2024-09-01', status: 'Đang học' },
    { studentId: 'S021', name: 'Ngô Thu Dung', birthDate: '2006-05-10', gender: 'Nữ', phone: '0923456802', parentZalo: 'Mẹ dung.nt', address: 'Hà Nội', className: 'English C1 - Advanced', registerDate: '2024-09-01', status: 'Đang học' },
    { studentId: 'S022', name: 'Đặng Phương Phong', birthDate: '2005-12-28', gender: 'Nam', phone: '0923456803', parentZalo: 'Mẹ phong.dp', address: 'Hà Nội', className: 'English C1 - Advanced', registerDate: '2024-09-01', status: 'Đang học' },
  ];
  await db.student.createMany({ data: studentData });

  // 4. Schedules
  console.log('📋 Seeding Schedules...');
  await db.schedule.createMany({
    data: [
      { scheduleId: 'SC001', className: 'English A1 - Beginner', date: '2026-04-10', dayOfWeek: 'T6', startTime: '18:00', endTime: '19:30', room: 'P1', teacher: 'Cô Lan' },
      { scheduleId: 'SC002', className: 'English A2 - Elementary', date: '2026-04-10', dayOfWeek: 'T6', startTime: '18:00', endTime: '19:30', room: 'P2', teacher: 'Cô Lê' },
      { scheduleId: 'SC003', className: 'English B1 - Intermediate', date: '2026-04-12', dayOfWeek: 'CN', startTime: '14:00', endTime: '15:30', room: 'P3', teacher: 'Thầy Minh' },
      { scheduleId: 'SC004', className: 'English B2 - Upper Intermediate', date: '2026-04-12', dayOfWeek: 'CN', startTime: '16:00', endTime: '17:30', room: 'P3', teacher: 'Thầy Minh' },
      { scheduleId: 'SC005', className: 'English C1 - Advanced', date: '2026-04-15', dayOfWeek: 'T3', startTime: '18:00', endTime: '19:30', room: 'P4', teacher: 'Thầy Hùng' },
      { scheduleId: 'SC006', className: 'English A1 - Beginner', date: '2026-04-15', dayOfWeek: 'T3', startTime: '18:00', endTime: '19:30', room: 'P1', teacher: 'Cô Lan' },
      { scheduleId: 'SC007', className: 'English A2 - Elementary', date: '2026-04-17', dayOfWeek: 'T5', startTime: '18:00', endTime: '19:30', room: 'P2', teacher: 'Cô Lê' },
      { scheduleId: 'SC008', className: 'English B1 - Intermediate', date: '2026-04-19', dayOfWeek: 'T7', startTime: '14:00', endTime: '15:30', room: 'P3', teacher: 'Thầy Minh' },
      { scheduleId: 'SC009', className: 'English B2 - Upper Intermediate', date: '2026-04-19', dayOfWeek: 'T7', startTime: '16:00', endTime: '17:30', room: 'P3', teacher: 'Thầy Minh' },
      { scheduleId: 'SC010', className: 'English C1 - Advanced', date: '2026-04-22', dayOfWeek: 'T2', startTime: '18:00', endTime: '19:30', room: 'P4', teacher: 'Thầy Hùng' },
      { scheduleId: 'SC011', className: 'English A1 - Beginner', date: '2026-04-22', dayOfWeek: 'T2', startTime: '18:00', endTime: '19:30', room: 'P1', teacher: 'Cô Lan' },
      { scheduleId: 'SC012', className: 'English A2 - Elementary', date: '2026-04-24', dayOfWeek: 'T4', startTime: '18:00', endTime: '19:30', room: 'P2', teacher: 'Cô Lê' },
    ],
  });

  // 5. Attendance (ngẫu nhiên)
  console.log('📋 Seeding Attendance...');
  const classMap: Record<string, string[]> = {
    'English A1 - Beginner': ['S001', 'S002', 'S003', 'S004', 'S005', 'S006', 'S007'],
    'English A2 - Elementary': ['S008', 'S009', 'S010', 'S011', 'S012'],
    'English B1 - Intermediate': ['S013', 'S014', 'S015', 'S016'],
    'English B2 - Upper Intermediate': ['S017', 'S018', 'S019', 'S020'],
    'English C1 - Advanced': ['S021', 'S022'],
  };
  const dates = ['2026-04-10', '2026-04-12', '2026-04-15', '2026-04-17', '2026-04-19', '2026-04-22', '2026-04-24'];
  let attIdx = 1;
  const attData: any[] = [];
  const dayNames: Record<string, string> = { '2026-04-10': 'T6', '2026-04-12': 'CN', '2026-04-15': 'T3', '2026-04-17': 'T5', '2026-04-19': 'T7', '2026-04-22': 'T2', '2026-04-24': 'T4' };

  for (const date of dates) {
    for (const [className, studentIds] of Object.entries(classMap)) {
      for (const sid of studentIds) {
        const rand = Math.random();
        let status: string;
        if (rand < 0.6) status = 'Có mặt';
        else if (rand < 0.75) status = 'Vắng';
        else if (rand < 0.9) status = 'Có phép';
        else status = 'Đi trễ';
        attData.push({
          attendanceId: `A${String(attIdx++).padStart(4, '0')}`,
          studentId: sid, className, date, dayOfWeek: dayNames[date] || 'T2',
          status, note: status === 'Vắng' ? 'Mẹ xin phép' : '',
          checkedAt: status !== 'Vắng' ? new Date(date + 'T18:00:00').toISOString() : null,
        });
      }
    }
  }
  await db.attendance.createMany({ data: attData });

  // 6. Evaluations
  console.log('📋 Seeding Evaluations...');
  const evalData = studentData.slice(0, 10).map((s, i) => {
    const notes = [
      'Học sinh tích cực, tiếp thu bài tốt. Cần luyện nói nhiều hơn.',
      'Tiến bộ rõ rệt, tự tin trong giao tiếp. Giữ vững phong độ.',
      'Cần chú ý hơn trong giờ học, hay nói riêng.',
      'Làm bài đầy đủ, ý thức tốt. Củng cố ngữ pháp.',
      'Học khá tốt, phát âm chuẩn. Tăng vốn từ vựng.',
      'Nhiệt tình, hay phát biểu. Cần rèn kỹ năng viết.',
      'Đúng giờ, chăm chỉ. Cần tự tin hơn khi nói.',
      'Tiếp thu nhanh, bài tập tốt. Giỏi nghe nói.',
      'Cần cố gắng thêm, hay nghỉ học. Liên hệ phụ huynh.',
      'Học sinh xuất sắc, gương mẫu trong lớp.',
    ];
    return {
      evaluationId: `E${String(i + 1).padStart(3, '0')}`,
      studentId: s.studentId, studentName: s.name, className: s.className,
      month: '04/2026', note: notes[i % notes.length],
    };
  });
  await db.evaluation.createMany({ data: evalData });

  // 7. Bills
  console.log('📋 Seeding Bills...');
  const billData = studentData.slice(0, 10).map((s, i) => {
    const sessions = 8 + Math.floor(Math.random() * 8);
    const amount = sessions * 150000;
    const paid = Math.random() > 0.3 ? amount : Math.floor(amount * 0.5);
    return {
      billId: `B${String(i + 1).padStart(3, '0')}`,
      studentId: s.studentId, studentName: s.name, className: s.className,
      month: '04/2026', sessions, amount, paid,
      payDate: paid >= amount ? '2026-04-15' : null,
      status: paid >= amount ? 'Đã thanh toán' : paid > 0 ? 'Thanh toán một phần' : 'Chưa thanh toán',
    };
  });
  await db.bill.createMany({ data: billData });

  // 8. Settings
  console.log('📋 Seeding Settings...');
  await db.setting.createMany({
    data: [
      { key: 'center_name', value: 'MsMyenEnglish' },
      { key: 'center_address', value: '123 Đường ABC, Quận 1, TP.HCM' },
      { key: 'center_phone', value: '0909-888-777' },
      { key: 'school_year', value: '2025-2026' },
    ],
  });

  console.log('\n✅ Seed hoàn tất!');
  console.log('   Tài khoản đăng nhập:');
  console.log('     admin / admin123');
  console.log('     teacher1 / teacher123');
  console.log('     teacher2 / teacher123');
}

main()
  .then(async () => { await db.$disconnect(); process.exit(0); })
  .catch(async (err) => {
    console.error('\n❌ Lỗi khi seed:', err);
    await db.$disconnect();
    process.exit(1);
  });
