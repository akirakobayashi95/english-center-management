import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const className = searchParams.get('className') || '';

    const where: Prisma.EvaluationWhereInput = {};
    if (className) where.className = className;

    const result = await db.evaluation.findMany({ where, orderBy: { id: 'asc' } });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('GET evaluations error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { evaluationId, studentId, studentName, className, date, attendScore, testScore, examScore, note, grade } = body;

    if (evaluationId) {
      await db.evaluation.update({
        where: { evaluationId },
        data: { attendScore, testScore, examScore, note, grade },
      });
      return NextResponse.json({ success: true, message: 'Cập nhật thành công!' });
    }

    const count = await db.evaluation.count();
    const newId = `E${String(count + 1).padStart(3, '0')}`;

    await db.evaluation.create({
      data: {
        evaluationId: newId,
        studentId,
        studentName,
        className,
        date: date || new Date().toISOString().split('T')[0],
        attendScore,
        testScore,
        examScore,
        note: note || '',
        grade,
      },
    });

    return NextResponse.json({ success: true, message: 'Thêm thành công!' });
  } catch (error) {
    console.error('POST evaluations error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { evaluationId } = await req.json();
    await db.evaluation.delete({ where: { evaluationId } });
    return NextResponse.json({ success: true, message: 'Xóa thành công!' });
  } catch (error) {
    console.error('DELETE evaluations error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}
