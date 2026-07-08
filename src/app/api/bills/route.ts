import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const className = searchParams.get('className') || '';

    const where: Prisma.BillWhereInput = {};
    if (className) where.className = className;

    const result = await db.bill.findMany({ where, orderBy: { id: 'asc' } });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('GET bills error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { billId, studentId, studentName, className, month, sessions, amount, paid, payDate, status } = body;

    if (billId) {
      await db.bill.update({
        where: { billId },
        data: { sessions, amount, paid, payDate: payDate || null, status },
      });
      return NextResponse.json({ success: true, message: 'Cập nhật thành công!' });
    }

    const count = await db.bill.count();
    const newId = `B${String(count + 1).padStart(3, '0')}`;

    await db.bill.create({
      data: {
        billId: newId,
        studentId,
        studentName,
        className,
        month: month || '',
        sessions: sessions || 0,
        amount: amount || 0,
        paid: paid || 0,
        payDate: payDate || null,
        status: status || 'Chưa thanh toán',
      },
    });

    return NextResponse.json({ success: true, message: 'Thêm thành công!' });
  } catch (error) {
    console.error('POST bills error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { billId } = await req.json();
    await db.bill.delete({ where: { billId } });
    return NextResponse.json({ success: true, message: 'Xóa thành công!' });
  } catch (error) {
    console.error('DELETE bills error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}
