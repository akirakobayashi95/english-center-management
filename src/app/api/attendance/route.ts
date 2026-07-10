import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const className = searchParams.get('className') || '';
    const date = searchParams.get('date') || '';
    const studentId = searchParams.get('studentId') || '';
    const month = searchParams.get('month') || '';

    const where: Prisma.AttendanceWhereInput = {};
    if (className) where.className = className;
    if (date) where.date = date;
    if (studentId) where.studentId = studentId;
    if (month) where.date = { startsWith: month };

    const result = await db.attendance.findMany({ where, orderBy: { id: 'asc' } });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('GET attendance error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.records) {
      // Bulk save from quick attendance
      for (const record of body.records) {
        const { studentId, className, date, status, note } = record;
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const dayOfWeek = days[new Date(date).getDay()];

        const existing = await db.attendance.findFirst({
          where: { studentId, date },
        });

        if (existing) {
          await db.attendance.update({
            where: { id: existing.id },
            data: { status, note: note || '', checkedAt: new Date().toISOString() },
          });
        } else {
          const count = await db.attendance.count();
          const newAttId = `A${String(count + 1).padStart(4, '0')}`;
          await db.attendance.create({
            data: {
              attendanceId: newAttId,
              studentId,
              className,
              date,
              dayOfWeek,
              status,
              note: note || '',
              checkedAt: new Date().toISOString(),
            },
          });
        }
      }
      return NextResponse.json({ success: true, message: 'Điểm danh thành công!' });
    }

    // Single record save
    const { attendanceId, studentId, className, date, status, note } = body;
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const dayOfWeek = days[new Date(date).getDay()];

    if (attendanceId) {
      await db.attendance.update({
        where: { attendanceId },
        data: { status, note: note || '', checkedAt: new Date().toISOString() },
      });
      return NextResponse.json({ success: true, message: 'Cập nhật thành công!' });
    }

    const existing = await db.attendance.findFirst({
      where: { studentId, date },
    });

    if (existing) {
      await db.attendance.update({
        where: { id: existing.id },
        data: { status, note: note || '', checkedAt: new Date().toISOString() },
      });
    } else {
      const count = await db.attendance.count();
      const newAttId = `A${String(count + 1).padStart(4, '0')}`;
      await db.attendance.create({
        data: {
          attendanceId: newAttId,
          studentId,
          className,
          date,
          dayOfWeek,
          status,
          note: note || '',
          checkedAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Lưu thành công!' });
  } catch (error) {
    console.error('POST attendance error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}
