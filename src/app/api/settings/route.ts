import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const result = await db.setting.findMany();
    const data: Record<string, string> = {};
    result.forEach(s => {
      data[s.key] = s.value || '';
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('GET settings error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    for (const [key, value] of Object.entries(body)) {
      const existing = await db.setting.findUnique({ where: { key } });
      if (existing) {
        await db.setting.update({
          where: { key },
          data: { value: String(value) },
        });
      } else {
        await db.setting.create({
          data: { key, value: String(value) },
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Lưu cài đặt thành công!' });
  } catch (error) {
    console.error('POST settings error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}
