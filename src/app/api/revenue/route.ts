import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Revenue statistics: by month, by class, by status, overall KPIs
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const className = searchParams.get('className') || '';

    const allBills = await db.bill.findMany();
    const filtered = className ? allBills.filter(b => b.className === className) : allBills;

    const totalAmount = filtered.reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalPaid = filtered.reduce((sum, b) => sum + (b.paid || 0), 0);
    const totalDebt = totalAmount - totalPaid;
    const collectionRate = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

    const paidCount = filtered.filter(b => b.status === 'Đã thanh toán').length;
    const unpaidCount = filtered.filter(b => b.status === 'Chưa thanh toán').length;
    const partialCount = filtered.filter(b => b.status === 'Thanh toán một phần').length;

    // By month
    const monthMap: Record<string, { amount: number; paid: number; debt: number; sessions: number }> = {};
    filtered.forEach(b => {
      const m = b.month || 'N/A';
      if (!monthMap[m]) monthMap[m] = { amount: 0, paid: 0, debt: 0, sessions: 0 };
      monthMap[m].amount += b.amount || 0;
      monthMap[m].paid += b.paid || 0;
      monthMap[m].debt += (b.amount || 0) - (b.paid || 0);
      monthMap[m].sessions += b.sessions || 0;
    });
    const byMonth = Object.entries(monthMap)
      .map(([month, v]) => ({ month, ...v }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // By class
    const classMap: Record<string, { className: string; amount: number; paid: number; debt: number; sessions: number; count: number }> = {};
    filtered.forEach(b => {
      const cn = b.className || 'Không rõ';
      if (!classMap[cn]) classMap[cn] = { className: cn, amount: 0, paid: 0, debt: 0, sessions: 0, count: 0 };
      classMap[cn].amount += b.amount || 0;
      classMap[cn].paid += b.paid || 0;
      classMap[cn].debt += (b.amount || 0) - (b.paid || 0);
      classMap[cn].sessions += b.sessions || 0;
      classMap[cn].count += 1;
    });
    const byClass = Object.values(classMap).sort((a, b) => b.amount - a.amount);

    // By status
    const statusMap: Record<string, { status: string; count: number; amount: number; paid: number }> = {};
    filtered.forEach(b => {
      const st = b.status || 'Khác';
      if (!statusMap[st]) statusMap[st] = { status: st, count: 0, amount: 0, paid: 0 };
      statusMap[st].count += 1;
      statusMap[st].amount += b.amount || 0;
      statusMap[st].paid += b.paid || 0;
    });
    const byStatus = Object.values(statusMap);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalAmount,
          totalPaid,
          totalDebt,
          collectionRate,
          billCount: filtered.length,
          paidCount,
          unpaidCount,
          partialCount,
        },
        byMonth,
        byClass,
        byStatus,
      },
    });
  } catch (error) {
    console.error('Revenue error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}
