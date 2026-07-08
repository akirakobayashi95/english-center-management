import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const className = searchParams.get('className') || '';
    const month = searchParams.get('month') || '';

    const where: Prisma.ScheduleWhereInput = {};
    if (className) where.className = className;
    if (month) where.date = { startsWith: month };

    const result = await db.schedule.findMany({ where, orderBy: { id: 'asc' } });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('GET schedules error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scheduleId, className, date, dayOfWeek, startTime, endTime, room, teacher, status } = body;

    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const dow = dayOfWeek || days[new Date(date).getDay()];

    if (scheduleId) {
      await db.schedule.update({
        where: { scheduleId },
        data: { className, date, dayOfWeek: dow, startTime, endTime, room, teacher, status },
      });
      return NextResponse.json({ success: true, message: 'Cập nhật thành công!' });
    }

    const count = await db.schedule.count();
    const newId = `SC${String(count + 1).padStart(3, '0')}`;

    await db.schedule.create({
      data: {
        scheduleId: newId,
        className,
        date,
        dayOfWeek: dow,
        startTime: startTime || '18:00',
        endTime: endTime || '19:30',
        room: room || '',
        teacher: teacher || '',
        status: status || 'Đã lên lịch',
      },
    });

    return NextResponse.json({ success: true, message: 'Thêm thành công!' });
  } catch (error) {
    console.error('POST schedules error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { scheduleId } = await req.json();
    await db.schedule.delete({ where: { scheduleId } });
    return NextResponse.json({ success: true, message: 'Xóa thành công!' });
  } catch (error) {
    console.error('DELETE schedules error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}
