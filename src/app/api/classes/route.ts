import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const result = await db.class.findMany({ orderBy: { id: 'asc' } });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('GET classes error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { classId, name, level, teacher, maxStudents, feePerSession, note } = body;

    if (classId) {
      await db.class.update({
        where: { classId },
        data: { name, level, teacher, maxStudents, feePerSession, note },
      });
      return NextResponse.json({ success: true, message: 'Cập nhật thành công!' });
    }

    const count = await db.class.count();
    const newId = `C${String(count + 1).padStart(3, '0')}`;

    await db.class.create({
      data: {
        classId: newId,
        name,
        level: level || 'Beginner',
        teacher: teacher || '',
        maxStudents: maxStudents || 25,
        feePerSession: feePerSession || 150000,
        note: note || '',
      },
    });

    return NextResponse.json({ success: true, message: 'Thêm thành công!' });
  } catch (error) {
    console.error('POST classes error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { classId } = await req.json();
    await db.class.delete({ where: { classId } });
    return NextResponse.json({ success: true, message: 'Xóa thành công!' });
  } catch (error) {
    console.error('DELETE classes error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}
