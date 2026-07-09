import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const className = searchParams.get('className') || '';
    const search = searchParams.get('search') || '';

    const where: Prisma.StudentWhereInput = {};
    if (className) where.className = className;
    if (search) where.name = { contains: search };

    const result = await db.student.findMany({ where, orderBy: { id: 'asc' } });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('GET students error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, name, birthDate, gender, phone, parentZalo, address, className, registerDate, note, status } = body;

    if (studentId) {
      await db.student.update({
        where: { studentId },
        data: { name, birthDate, gender, phone, parentZalo, address, className, note, status },
      });
      return NextResponse.json({ success: true, message: 'Cập nhật thành công!' });
    }

    const count = await db.student.count();
    const newId = `S${String(count + 1).padStart(3, '0')}`;

    await db.student.create({
      data: {
        studentId: newId,
        name,
        birthDate: birthDate || new Date().toISOString().split('T')[0],
        gender: gender || 'Nam',
        phone: phone || '',
        parentZalo: parentZalo || '',
        address: address || '',
        className: className || '',
        registerDate: registerDate || new Date().toISOString().split('T')[0],
        note: note || '',
        status: status || 'Đang học',
      },
    });

    return NextResponse.json({ success: true, message: 'Thêm thành công!' });
  } catch (error) {
    console.error('POST students error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { studentId } = await req.json();
    await db.student.delete({ where: { studentId } });
    return NextResponse.json({ success: true, message: 'Xóa thành công!' });
  } catch (error) {
    console.error('DELETE students error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}
