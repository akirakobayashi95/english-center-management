import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const className = searchParams.get('className') || '';

    const studentWhere: Prisma.StudentWhereInput = {};
    if (className) studentWhere.className = className;

    const attWhere: Prisma.AttendanceWhereInput = {};
    if (className) attWhere.className = className;

    const allStudents = await db.student.findMany({ where: studentWhere });
    const allAttendance = await db.attendance.findMany({ where: attWhere });
    const allClasses = await db.class.findMany();

    // Calculate stats
    const totalPresent = allAttendance.filter(a => a.status === 'Có mặt').length;
    const totalAbsent = allAttendance.filter(a => a.status === 'Vắng').length;
    const totalExcused = allAttendance.filter(a => a.status === 'Có phép').length;
    const totalAttendance = allAttendance.length;

    // Daily stats
    const dailyStats: Record<string, { present: number; absent: number; excused: number }> = {};
    allAttendance.forEach(a => {
      if (!a.date) return;
      if (!dailyStats[a.date]) {
        dailyStats[a.date] = { present: 0, absent: 0, excused: 0 };
      }
      if (a.status === 'Có mặt') dailyStats[a.date].present++;
      else if (a.status === 'Vắng') dailyStats[a.date].absent++;
      else if (a.status === 'Có phép') dailyStats[a.date].excused++;
    });

    // Per-student stats
    const studentStats: Record<string, { name: string; className: string; present: number; absent: number; excused: number; total: number }> = {};
    allStudents.forEach(s => {
      studentStats[s.studentId] = {
        name: s.name,
        className: s.className || '',
        present: 0,
        absent: 0,
        excused: 0,
        total: 0,
      };
    });

    allAttendance.forEach(a => {
      if (studentStats[a.studentId]) {
        studentStats[a.studentId].total++;
        if (a.status === 'Có mặt') studentStats[a.studentId].present++;
        else if (a.status === 'Vắng') studentStats[a.studentId].absent++;
        else if (a.status === 'Có phép') studentStats[a.studentId].excused++;
      }
    });

    const studentStatsArray = Object.entries(studentStats).map(([id, s]) => ({
      studentId: id,
      name: s.name,
      className: s.className,
      present: s.present,
      absent: s.absent,
      excused: s.excused,
      total: s.total,
      attendanceRate: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalPresent,
          totalAbsent,
          totalExcused,
          totalAttendance,
          presentRate: totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 100) : 0,
        },
        dailyStats,
        studentStats: studentStatsArray,
        classes: allClasses.map(c => c.name),
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server!' }, { status: 500 });
  }
}
