import { NextRequest, NextResponse } from 'next/server';
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
      await db.user.update({
        where: { userId },
        data: { username, password, fullName, role, email, phone, status },
      });
      return NextResponse.json({ success: true, message: 'Cập nhật thành công!' });
    }

    const count = await db.user.count();
    const newId = `U${String(count + 1).padStart(3, '0')}`;

    await db.user.create({
      data: {
        userId: newId,
        username,
        password,
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
