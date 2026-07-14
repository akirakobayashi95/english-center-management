import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const user = await db.user.findFirst({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Sai tên đăng nhập hoặc mật khẩu!' }, { status: 401 });
    }

    // So sánh mật khẩu nhập vào với hash đã lưu (hỗ trợ backward-compat với mật khẩu plain-text cũ)
    const isMatch = await bcrypt.compare(password, user.password).catch(() => password === user.password);
    if (!isMatch) {
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
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}
