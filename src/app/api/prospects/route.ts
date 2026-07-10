import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status') || '';

    const where: Prisma.ProspectWhereInput = {};
    if (status) where.status = status;

    const result = await db.prospect.findMany({ where, orderBy: { id: 'asc' } });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('GET prospects error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prospectId, contactDate, parentZalo, phone, studentName, gender, gradeAge, desiredTime, testStatus, suggestedClass, note, status, linkedStudentId } = body;

    if (prospectId) {
      const updateData: any = { contactDate, parentZalo, phone, studentName, gender, gradeAge, desiredTime, testStatus, suggestedClass, note, status };
      if (linkedStudentId !== undefined) updateData.linkedStudentId = linkedStudentId;
      await db.prospect.update({
        where: { prospectId },
        data: updateData,
      });
      return NextResponse.json({ success: true, message: 'Cập nhật thành công!' });
    }

    const count = await db.prospect.count();
    const newId = `P${String(count + 1).padStart(3, '0')}`;

    await db.prospect.create({
      data: {
        prospectId: newId,
        contactDate: contactDate || '',
        parentZalo: parentZalo || '',
        phone: phone || '',
        studentName: studentName || '',
        gender: gender || '',
        gradeAge: gradeAge || '',
        desiredTime: desiredTime || '',
        testStatus: testStatus || 'Chưa test',
        suggestedClass: suggestedClass || '',
        note: note || '',
        status: status || 'Đang chờ',
      },
    });

    return NextResponse.json({ success: true, message: 'Thêm HS chờ thành công!' });
  } catch (error) {
    console.error('POST prospects error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { prospectId } = await req.json();
    await db.prospect.delete({ where: { prospectId } });
    return NextResponse.json({ success: true, message: 'Xóa thành công!' });
  } catch (error) {
    console.error('DELETE prospects error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}
