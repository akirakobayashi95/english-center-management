import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const user = await db.user.findFirst({
      where: { username },
    });

    if (!user || user.password !== password) {
      return NextResponse.json({ success: false, message: 'Sai tên đăng nhập hoặc mật khẩu!' }, { status: 401 });
    }

    if (user.status !== 'Active') {
      return NextResponse.json({ success: false, message: 'Tài khoản đã bị khóa!' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.userId,
        username: user.username,
        name: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}
