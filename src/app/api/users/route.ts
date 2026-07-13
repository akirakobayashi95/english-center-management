import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const result = await db.user.findMany({ orderBy: { id: 'asc' } });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('GET users error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, username, password, fullName, role, email, phone, status } = body;

    if (userId) {
      // Khi cập nhật: nếu password khác rỗng thì băm lại; nếu rỗng thì giữ nguyên
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.user.update({
          where: { userId },
          data: { username, password: hashedPassword, fullName, role, email, phone, status },
        });
      } else {
        await db.user.update({
          where: { userId },
          data: { username, fullName, role, email, phone, status },
        });
      }
      return NextResponse.json({ success: true, message: 'Cập nhật thành công!' });
    }

    if (!password) {
      return NextResponse.json({ success: false, message: 'Mật khẩu không được để trống!' }, { status: 400 });
    }

    const count = await db.user.count();
    const newId = `U${String(count + 1).padStart(3, '0')}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        userId: newId,
        username,
        password: hashedPassword,
        fullName,
        role: role || 'Giáo viên',
        email: email || '',
        phone: phone || '',
        status: status || 'Active',
      },
    });

    return NextResponse.json({ success: true, message: 'Thêm thành công!' });
  } catch (error) {
    console.error('POST users error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json();
    await db.user.delete({ where: { userId } });
    return NextResponse.json({ success: true, message: 'Xóa thành công!' });
  } catch (error) {
    console.error('DELETE users error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}
