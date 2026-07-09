'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Users, School, Calendar, CheckSquare,
  Star, FileText, Receipt, UserCog, Settings, LogOut,
  Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight,
  Menu, X, Printer, Download, DollarSign, TrendingUp
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, isSameDay } from 'date-fns';

// Types
type Student = { id: number; studentId: string; name: string; birthDate: string | null; gender: string; phone: string; email: string; address: string; className: string; registerDate: string; note: string; status: string };
type ClassItem = { id: number; classId: string; name: string; level: string; teacher: string; maxStudents: number; feePerSession: number; note: string };
type ScheduleItem = { id: number; scheduleId: string; className: string; date: string; dayOfWeek: string; startTime: string; endTime: string; room: string; teacher: string; status: string };
type AttendanceItem = { id: number; attendanceId: string; studentId: string; className: string; date: string; dayOfWeek: string; status: string; note: string };
type EvaluationItem = { id: number; evaluationId: string; studentId: string; studentName: string; className: string; date: string; attendScore: number; testScore: number; examScore: number; note: string; grade: string };
type BillItem = { id: number; billId: string; studentId: string; studentName: string; className: string; month: string; sessions: number; amount: number; paid: number; payDate: string | null; status: string };
type UserItem = { id: number; userId: string; username: string; password: string; fullName: string; role: string; email: string; phone: string; status: string };
type DashboardData = {
  stats: { totalPresent: number; totalAbsent: number; totalExcused: number; totalLate: number; totalAttendance: number; presentRate: number };
  dailyStats: Record<string, { present: number; absent: number; excused: number; late: number }>;
  studentStats: Array<{ studentId: string; name: string; className: string; present: number; absent: number; excused: number; late: number; total: number; attendanceRate: number }>;
  classes: string[];
};
type RevenueData = {
  stats: { totalAmount: number; totalPaid: number; totalDebt: number; collectionRate: number; billCount: number; paidCount: number; unpaidCount: number; partialCount: number };
  byMonth: Array<{ month: string; amount: number; paid: number; debt: number; sessions: number }>;
  byClass: Array<{ className: string; amount: number; paid: number; debt: number; sessions: number; count: number }>;
  byStatus: Array<{ status: string; count: number; amount: number; paid: number }>;
};

const LEVELS = ['Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate', 'Advanced', 'Proficient'];
const LEVEL_COLORS: Record<string, string> = {
  'Beginner': 'bg-green-100 text-green-700',
  'Elementary': 'bg-blue-100 text-blue-700',
  'Intermediate': 'bg-yellow-100 text-yellow-700',
  'Upper Intermediate': 'bg-orange-100 text-orange-700',
  'Advanced': 'bg-purple-100 text-purple-700',
  'Proficient': 'bg-indigo-100 text-indigo-700',
};

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  'Có mặt': { bg: 'bg-green-100', text: 'text-green-700', icon: '✅' },
  'Vắng': { bg: 'bg-red-100', text: 'text-red-700', icon: '❌' },
  'Có phép': { bg: 'bg-blue-100', text: 'text-blue-700', icon: '📋' },
  'Đi trễ': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '⏰' },
  'Đang học': { bg: 'bg-green-100', text: 'text-green-700', icon: '' },
  'Nghỉ học': { bg: 'bg-red-100', text: 'text-red-700', icon: '' },
  'Bảo lưu': { bg: 'bg-gray-100', text: 'text-gray-600', icon: '' },
  'Đã thanh toán': { bg: 'bg-green-100', text: 'text-green-700', icon: '' },
  'Chưa thanh toán': { bg: 'bg-red-100', text: 'text-red-700', icon: '' },
  'Thanh toán một phần': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '' },
};
const GRADE_COLORS: Record<string, string> = { 'Giỏi': '#22c55e', 'Khá': '#3b82f6', 'Trung bình': '#f59e0b', 'Yếu': '#ef4444' };

const inputClass = "w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 outline-none text-sm";
const selectClass = "w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 outline-none text-sm bg-white";
const btnPrimary = "px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg text-sm transition-colors";
const btnSecondary = "px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm transition-colors";
const btnDanger = "px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg text-sm transition-colors";
const btnSuccess = "px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg text-sm transition-colors";

const pageTitles: Record<string, string> = {
  dashboard: 'Tổng quan', students: 'Học sinh', classes: 'Lớp học', schedule: 'Thời khoá biểu',
  attendance: 'Điểm danh', evaluation: 'Đánh giá', grades: 'Điểm số', bills: 'Hoá đơn',
  revenue: 'Thống kê doanh thu', users: 'Người dùng', settings: 'Cài đặt',
};

const navItems = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard, section: 'Tổng quan' },
  { id: 'students', label: 'Học sinh', icon: Users, section: 'Quản lý' },
  { id: 'classes', label: 'Lớp học', icon: School, section: 'Quản lý' },
  { id: 'schedule', label: 'Thời khoá biểu', icon: Calendar, section: 'Quản lý' },
  { id: 'attendance', label: 'Điểm danh', icon: CheckSquare, section: 'Hoạt động' },
  { id: 'evaluation', label: 'Đánh giá', icon: Star, section: 'Hoạt động' },
  { id: 'grades', label: 'Điểm số', icon: FileText, section: 'Hoạt động' },
  { id: 'bills', label: 'Hoá đơn', icon: Receipt, section: 'Hoạt động' },
  { id: 'revenue', label: 'Thống kê doanh thu', icon: TrendingUp, section: 'Tài chính' },
  { id: 'users', label: 'Người dùng', icon: UserCog, section: 'Hệ thống' },
  { id: 'settings', label: 'Cài đặt', icon: Settings, section: 'Hệ thống' },
];

const api = async (url: string, options?: RequestInit) => {
  const res = await fetch(`/api${url}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  return res.json();
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN').format(amount) + '₫';
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '';
  try { return format(parseISO(dateStr), 'dd/MM/yyyy'); } catch { return dateStr; }
};
const getDayOfWeek = (dateStr: string) => {
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return days[parseISO(dateStr).getDay()];
};

type StudentForm = { studentId?: string; name: string; birthDate: string; gender: string; phone: string; email: string; address: string; className: string; note: string; status: string };
const emptyStudent: StudentForm = { name: '', birthDate: '', gender: 'Nam', phone: '', email: '', address: '', className: '', note: '', status: 'Đang học' };

type ClassForm = { classId?: string; name: string; level: string; teacher: string; maxStudents: number; feePerSession: number; note: string };
const emptyClass: ClassForm = { name: '', level: 'Beginner', teacher: '', maxStudents: 25, feePerSession: 150000, note: '' };

type ScheduleForm = { className: string; date: string; startTime: string; endTime: string; room: string; teacher: string };
const emptySchedule: ScheduleForm = { className: '', date: '', startTime: '18:00', endTime: '19:30', room: '', teacher: '' };

type EvaluationForm = { studentId: string; studentName: string; className: string; date: string; attendScore: number; testScore: number; examScore: number; note: string };
const emptyEvaluation: EvaluationForm = { studentId: '', studentName: '', className: '', date: '', attendScore: 85, testScore: 80, examScore: 85, note: '' };

type BillForm = { studentId: string; studentName: string; className: string; month: string; sessions: number; amount: number; paid: number; payDate: string; status: string };
const emptyBill: BillForm = { studentId: '', studentName: '', className: '', month: '', sessions: 0, amount: 0, paid: 0, payDate: '', status: 'Chưa thanh toán' };

type UserForm = { userId?: string; username: string; password: string; fullName: string; role: string; email: string; phone: string; status: string };
const emptyUser: UserForm = { username: '', password: '', fullName: '', role: 'Giáo viên', email: '', phone: '', status: 'Active' };

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [loginForm, setLoginForm] = useState({ username: 'admin', password: 'admin123' });
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedClass, setSelectedClass] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [scheduleMonth, setScheduleMonth] = useState(new Date());
  const [attendanceMonth, setAttendanceMonth] = useState(new Date());

  // Data
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [attendance, setAttendance] = useState<AttendanceItem[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [bills, setBills] = useState<BillItem[]>([]);
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [quickAttData, setQuickAttData] = useState<Record<string, string>>({});

  // Modal states
  const [studentModal, setStudentModal] = useState({ open: false, editing: false, data: { ...emptyStudent } as StudentForm });
  const [classModal, setClassModal] = useState({ open: false, editing: false, data: { ...emptyClass } as ClassForm });
  const [scheduleModal, setScheduleModal] = useState({ open: false, data: { ...emptySchedule } as ScheduleForm });
  const [quickAttModal, setQuickAttModal] = useState(false);
  const [evaluationModal, setEvaluationModal] = useState({ open: false, data: { ...emptyEvaluation } as EvaluationForm });
  const [billModal, setBillModal] = useState({ open: false, data: { ...emptyBill } as BillForm });
  const [userModal, setUserModal] = useState({ open: false, editing: false, data: { ...emptyUser } as UserForm });
  const [attCellModal, setAttCellModal] = useState({ open: false, date: '', studentId: '', status: '', note: '' });

  const showToast = useCallback((message: string, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Seed on mount
  useEffect(() => {
    fetch('/api/seed', { method: 'POST' }).catch(() => {});
  }, []);

  const loadClasses = useCallback(async () => {
    const res = await api('/classes');
    if (res.success) setClasses(res.data);
  }, []);

  const loadData = useCallback(async (page?: string) => {
    const p = page || currentPage;
    switch (p) {
      case 'dashboard': {
        const dRes = await api(`/dashboard?className=${selectedClass}`);
        if (dRes.success) setDashboardData(dRes.data);
        const rRes = await api(`/revenue?className=${selectedClass}`);
        if (rRes.success) setRevenueData(rRes.data);
        break;
      }
      case 'students': {
        const sRes = await api(`/students?className=${selectedClass}&search=${searchTerm}`);
        if (sRes.success) setStudents(sRes.data);
        break;
      }
      case 'classes': {
        const cRes = await api('/classes');
        if (cRes.success) setClasses(cRes.data);
        break;
      }
      case 'schedule': {
        const monthStr = format(scheduleMonth, 'yyyy-MM');
        const schRes = await api(`/schedules?className=${selectedClass}&month=${monthStr}`);
        if (schRes.success) setSchedules(schRes.data);
        break;
      }
      case 'attendance': {
        const monthStr = format(attendanceMonth, 'yyyy-MM');
        const attRes = await api(`/attendance?className=${selectedClass}&month=${monthStr}`);
        if (attRes.success) setAttendance(attRes.data);
        break;
      }
      case 'evaluation': case 'grades': {
        const eRes = await api(`/evaluations?className=${selectedClass}`);
        if (eRes.success) setEvaluations(eRes.data);
        break;
      }
      case 'bills': {
        const bRes = await api(`/bills?className=${selectedClass}`);
        if (bRes.success) setBills(bRes.data);
        break;
      }
      case 'revenue': {
        const revRes = await api(`/revenue?className=${selectedClass}`);
        if (revRes.success) setRevenueData(revRes.data);
        const bRes = await api(`/bills?className=${selectedClass}`);
        if (bRes.success) setBills(bRes.data);
        break;
      }
      case 'users': {
        const uRes = await api('/users');
        if (uRes.success) setUsersList(uRes.data);
        break;
      }
      case 'settings': {
        const setRes = await api('/settings');
        if (setRes.success) setSettings(setRes.data);
        break;
      }
    }
  }, [currentPage, selectedClass, scheduleMonth, attendanceMonth, searchTerm]);

  useEffect(() => {
    // Data loaders are async; setState happens after fetch resolves (not synchronously)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (loggedIn) { loadClasses(); loadData(); }
  }, [loggedIn]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (loggedIn) loadData();
  }, [currentPage, selectedClass, scheduleMonth, attendanceMonth, loadData]);

  useEffect(() => {
    if (currentPage === 'students' && loggedIn) {
      api(`/students?className=${selectedClass}&search=${searchTerm}`).then(r => { if (r.success) setStudents(r.data); });
    }
  }, [searchTerm, selectedClass, currentPage, loggedIn]);

  const handleLogin = async () => {
    setLoading(true); setLoginError('');
    const res = await api('/login', { method: 'POST', body: JSON.stringify(loginForm) });
    setLoading(false);
    if (res.success) { setLoggedIn(true); setUser(res.user); } else { setLoginError(res.message); }
  };

  const handleLogout = () => { setLoggedIn(false); setUser(null); };

  // CRUD handlers
  const saveStudent = async () => {
    const d = studentModal.data;
    if (!d.name || !d.className) { showToast('Vui lòng nhập họ tên và chọn lớp!', 'error'); return; }
    setLoading(true);
    const res = await api('/students', { method: 'POST', body: JSON.stringify({ studentId: d.studentId || null, name: d.name, birthDate: d.birthDate, gender: d.gender, phone: d.phone, email: d.email, address: d.address, className: d.className, note: d.note, status: d.status }) });
    setLoading(false);
    if (res.success) { showToast(res.message); setStudentModal({ ...studentModal, open: false }); loadData('students'); }
    else showToast(res.message, 'error');
  };

  const deleteStudent = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    const res = await api('/students', { method: 'DELETE', body: JSON.stringify({ studentId: id }) });
    if (res.success) { showToast(res.message); loadData('students'); }
  };

  const saveClassItem = async () => {
    const d = classModal.data;
    if (!d.name) { showToast('Vui lòng nhập tên lớp!', 'error'); return; }
    setLoading(true);
    const res = await api('/classes', { method: 'POST', body: JSON.stringify({ classId: d.classId || null, name: d.name, level: d.level, teacher: d.teacher, maxStudents: d.maxStudents, feePerSession: d.feePerSession, note: d.note }) });
    setLoading(false);
    if (res.success) { showToast(res.message); setClassModal({ ...classModal, open: false }); loadClasses(); }
    else showToast(res.message, 'error');
  };

  const deleteClassItem = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    const res = await api('/classes', { method: 'DELETE', body: JSON.stringify({ classId: id }) });
    if (res.success) { showToast(res.message); loadClasses(); }
  };

  const saveScheduleItem = async () => {
    const d = scheduleModal.data;
    if (!d.className || !d.date) { showToast('Vui lòng chọn lớp và ngày!', 'error'); return; }
    setLoading(true);
    const res = await api('/schedules', { method: 'POST', body: JSON.stringify(d) });
    setLoading(false);
    if (res.success) { showToast(res.message); setScheduleModal({ open: false, data: { ...emptySchedule } }); loadData('schedule'); }
    else showToast(res.message, 'error');
  };

  const saveQuickAtt = async () => {
    setLoading(true);
    const records = Object.entries(quickAttData).map(([studentId, status]) => ({
      studentId, className: selectedClass, date: new Date().toISOString().split('T')[0], status, note: '',
    }));
    const res = await api('/attendance', { method: 'POST', body: JSON.stringify({ records }) });
    setLoading(false);
    if (res.success) { showToast(res.message); setQuickAttModal(false); loadData('attendance'); }
    else showToast(res.message, 'error');
  };

  const saveCellAtt = async () => {
    const { date, studentId, status, note } = attCellModal;
    if (!studentId || !date || !status) return;
    const className = selectedClass || students.find(s => s.studentId === studentId)?.className || '';
    const res = await api('/attendance', { method: 'POST', body: JSON.stringify({ studentId, className, date, status, note }) });
    if (res.success) {
      showToast('Đã cập nhật!');
      setAttCellModal({ open: false, date: '', studentId: '', status: '', note: '' });
      loadData('attendance');
    }
  };

  const saveEvaluationItem = async () => {
    const d = evaluationModal.data;
    if (!d.studentId) { showToast('Vui lòng chọn học sinh!', 'error'); return; }
    const total = Math.round(d.attendScore * 0.3 + d.testScore * 0.3 + d.examScore * 0.4);
    const grade = total >= 90 ? 'Giỏi' : total >= 75 ? 'Khá' : total >= 60 ? 'Trung bình' : 'Yếu';
    setLoading(true);
    const res = await api('/evaluations', { method: 'POST', body: JSON.stringify({ ...d, grade }) });
    setLoading(false);
    if (res.success) { showToast(res.message); setEvaluationModal({ open: false, data: { ...emptyEvaluation } }); loadData('evaluation'); }
    else showToast(res.message, 'error');
  };

  const deleteEvaluationItem = async (id: string) => {
    if (!confirm('Xóa đánh giá này?')) return;
    const res = await api('/evaluations', { method: 'DELETE', body: JSON.stringify({ evaluationId: id }) });
    if (res.success) { showToast(res.message); loadData('evaluation'); }
  };

  const saveBillItem = async () => {
    const d = billModal.data;
    if (!d.studentId) { showToast('Vui lòng chọn học sinh!', 'error'); return; }
    setLoading(true);
    const res = await api('/bills', { method: 'POST', body: JSON.stringify(d) });
    setLoading(false);
    if (res.success) { showToast(res.message); setBillModal({ open: false, data: { ...emptyBill } }); loadData('bills'); }
    else showToast(res.message, 'error');
  };

  const deleteBillItem = async (id: string) => {
    if (!confirm('Xóa hoá đơn này?')) return;
    const res = await api('/bills', { method: 'DELETE', body: JSON.stringify({ billId: id }) });
    if (res.success) { showToast(res.message); loadData('bills'); }
  };

  const payBill = async (bill: BillItem) => {
    const res = await api('/bills', { method: 'POST', body: JSON.stringify({ ...bill, billId: bill.billId, paid: bill.amount, payDate: new Date().toISOString().split('T')[0], status: 'Đã thanh toán' }) });
    if (res.success) { showToast('Thanh toán thành công!'); loadData('bills'); }
  };

  const generateBillsFromAttendance = async () => {
    const monthStr = format(attendanceMonth, 'MM/yyyy');
    const filteredStudents = selectedClass ? students.filter(s => s.className === selectedClass) : students;
    const filteredAtt = selectedClass
      ? attendance.filter(a => a.className === selectedClass && a.date?.startsWith(format(attendanceMonth, 'yyyy-MM')))
      : attendance.filter(a => a.date?.startsWith(format(attendanceMonth, 'yyyy-MM')));

    setLoading(true);
    for (const student of filteredStudents) {
      const studentAtt = filteredAtt.filter(a => a.studentId === student.studentId && a.status === 'Có mặt');
      const presentCount = studentAtt.length;
      if (presentCount === 0) continue;

      const cls = classes.find(c => c.name === student.className);
      const feePerSession = cls?.feePerSession || 150000;
      const amount = presentCount * feePerSession;

      // Check if bill already exists
      const existingBills = bills.filter(b => b.studentId === student.studentId && b.month === monthStr);
      if (existingBills.length > 0) continue;

      await api('/bills', {
        method: 'POST',
        body: JSON.stringify({
          studentId: student.studentId,
          studentName: student.name,
          className: student.className,
          month: monthStr,
          sessions: presentCount,
          amount,
          paid: 0,
          payDate: '',
          status: 'Chưa thanh toán',
        }),
      });
    }
    setLoading(false);
    showToast(`Đã tạo hoá đơn cho tháng ${monthStr}`);
    loadData('bills');
  };

  const saveUserItem = async () => {
    const d = userModal.data;
    if (!d.username || !d.password || !d.fullName) { showToast('Vui lòng nhập đầy đủ!', 'error'); return; }
    setLoading(true);
    const res = await api('/users', { method: 'POST', body: JSON.stringify({ userId: d.userId || null, username: d.username, password: d.password, fullName: d.fullName, role: d.role, email: d.email, phone: d.phone, status: d.status }) });
    setLoading(false);
    if (res.success) { showToast(res.message); setUserModal({ ...userModal, open: false }); loadData('users'); }
    else showToast(res.message, 'error');
  };

  const deleteUserItem = async (id: string) => {
    if (!confirm('Xóa người dùng này?')) return;
    const res = await api('/users', { method: 'DELETE', body: JSON.stringify({ userId: id }) });
    if (res.success) { showToast(res.message); loadData('users'); }
  };

  const saveSettingsData = async () => {
    setLoading(true);
    const res = await api('/settings', { method: 'POST', body: JSON.stringify(settings) });
    setLoading(false);
    if (res.success) showToast(res.message);
    else showToast(res.message, 'error');
  };

  // Status Badge
  const StatusBadge = ({ status }: { status: string }) => {
    const colors = STATUS_COLORS[status] || { bg: 'bg-gray-100', text: 'text-gray-600' };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>{status}</span>;
  };

  const LevelBadge = ({ level }: { level: string }) => {
    const color = LEVEL_COLORS[level] || 'bg-gray-100 text-gray-600';
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{level}</span>;
  };

  // Donut Chart
  const DonutChart = ({ data }: { data: DashboardData['stats'] }) => {
    const total = data.totalAttendance || 1;
    const items = [
      { label: 'Có mặt', value: data.totalPresent, color: '#22c55e' },
      { label: 'Vắng', value: data.totalAbsent, color: '#ef4444' },
      { label: 'Có phép', value: data.totalExcused, color: '#3b82f6' },
      { label: 'Đi trễ', value: data.totalLate, color: '#f59e0b' },
    ];
    let cumulative = 0;
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    return (
      <div className="flex items-center gap-8">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {items.map((item, i) => {
            const percent = (item.value / total) * 100;
            const dashArray = `${(percent / 100) * circumference} ${circumference}`;
            const dashOffset = -(cumulative / 100) * circumference;
            cumulative += percent;
            return <circle key={i} cx="100" cy="100" r={radius} fill="none" stroke={item.color} strokeWidth="24" strokeDasharray={dashArray} strokeDashoffset={dashOffset} transform="rotate(-90 100 100)" />;
          })}
          <text x="100" y="95" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#1e293b">{data.presentRate}%</text>
          <text x="100" y="118" textAnchor="middle" fontSize="12" fill="#64748b">Có mặt</text>
        </svg>
        <div className="flex flex-col gap-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.label}: {Math.round((item.value / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Bar Chart
  const BarChart = ({ dailyStats }: { dailyStats: DashboardData['dailyStats'] }) => {
    const days = Object.keys(dailyStats).sort().slice(0, 10);
    if (days.length === 0) return <p className="text-center text-gray-500 py-10">Chưa có dữ liệu</p>;
    const maxVal = Math.max(...days.map(d => dailyStats[d].present));
    return (
      <div className="flex items-end gap-4 h-48 pt-4">
        {days.map((day, i) => {
          const height = Math.max((dailyStats[day].present / (maxVal || 1)) * 140, 4);
          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div className="w-8 bg-green-500 rounded-t transition-all" style={{ height: `${height}px` }} title={`Có mặt: ${dailyStats[day].present}, Vắng: ${dailyStats[day].absent}`} />
              <span className="text-xs text-gray-500 whitespace-nowrap">{format(parseISO(day), 'dd/MM')}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Login Page
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 w-full max-w-md shadow-2xl">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">📚</div>
            <h1 className="text-2xl font-bold text-slate-800">MsMyenEnglish</h1>
            <p className="text-gray-500 mt-1">Trung Tâm Dạy Tiếng Anh</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Tên đăng nhập</label>
              <input type="text" value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Mật khẩu</label>
              <input type="password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} onKeyDown={e => e.key === 'Enter' && handleLogin()} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 outline-none" />
            </div>
            <button onClick={handleLogin} disabled={loading} className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50">
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
            {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
          </div>
        </div>
      </div>
    );
  }

  // Render pages
  const renderDashboard = () => {
    if (!dashboardData) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" /></div>;
    const d = dashboardData;
    const r = revenueData;
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          {[
            { icon: '✅', label: 'Có mặt', value: d.stats.totalPresent, color: 'bg-green-100' },
            { icon: '❌', label: 'Vắng', value: d.stats.totalAbsent, color: 'bg-red-100' },
            { icon: '📋', label: 'Có phép', value: d.stats.totalExcused, color: 'bg-blue-100' },
            { icon: '⏰', label: 'Đi trễ', value: d.stats.totalLate, color: 'bg-yellow-100' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-3 sm:p-5 flex items-center gap-2 sm:gap-4 shadow-sm">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${s.color} flex items-center justify-center text-lg sm:text-2xl flex-shrink-0`}>{s.icon}</div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold leading-tight">{s.value}</div>
                <div className="text-xs sm:text-sm text-gray-500 truncate">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue summary on Dashboard */}
        {r && (
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-4 sm:p-6 shadow-sm text-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2"><TrendingUp size={18} /> Thống kê Doanh thu</h3>
              <button className="text-xs sm:text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg font-semibold transition-colors" onClick={() => setCurrentPage('revenue')}>Chi tiết →</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white/15 rounded-lg p-3">
                <div className="text-xs opacity-90">Tổng doanh thu</div>
                <div className="text-base sm:text-xl font-bold mt-1 break-all">{formatCurrency(r.stats.totalAmount)}</div>
              </div>
              <div className="bg-white/15 rounded-lg p-3">
                <div className="text-xs opacity-90">Đã thu</div>
                <div className="text-base sm:text-xl font-bold mt-1 break-all">{formatCurrency(r.stats.totalPaid)}</div>
              </div>
              <div className="bg-white/15 rounded-lg p-3">
                <div className="text-xs opacity-90">Còn nợ</div>
                <div className="text-base sm:text-xl font-bold mt-1 break-all">{formatCurrency(r.stats.totalDebt)}</div>
              </div>
              <div className="bg-white/15 rounded-lg p-3">
                <div className="text-xs opacity-90">Tỷ lệ thu</div>
                <div className="text-base sm:text-xl font-bold mt-1">{r.stats.collectionRate}%</div>
                <div className="w-full h-1.5 bg-white/25 rounded-full overflow-hidden mt-1.5">
                  <div className="h-full bg-white rounded-full transition-all" style={{ width: `${r.stats.collectionRate}%` }} />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 text-xs sm:text-sm">
              <span className="flex items-center gap-1">📄 {r.stats.billCount} hoá đơn</span>
              <span className="flex items-center gap-1">✅ {r.stats.paidCount} đã thu</span>
              <span className="flex items-center gap-1">⏳ {r.stats.partialCount} thu một phần</span>
              <span className="flex items-center gap-1">❌ {r.stats.unpaidCount} chưa thu</span>
            </div>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm overflow-x-auto">
            <h3 className="font-bold mb-4 text-sm sm:text-base">📈 Tỷ lệ trạng thái</h3>
            <div className="min-w-[280px]">
              <DonutChart data={d.stats} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-sm sm:text-base">📊 Chi tiết theo ngày</h3>
            <BarChart dailyStats={d.dailyStats} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b flex justify-between items-center">
            <h3 className="font-bold">📋 Thống kê chi tiết Điểm danh</h3>
            <div className="flex gap-2">
              <button className={`${btnSecondary} flex items-center gap-1`}><Download size={14} /> Xuất Excel</button>
              <button className={`${btnSecondary} flex items-center gap-1`} onClick={() => window.print()}><Printer size={14} /> In</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[600px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-semibold text-gray-500">Học sinh</th>
                  <th className="text-left p-3 font-semibold text-gray-500">Lớp</th>
                  <th className="text-center p-3 font-semibold text-gray-500">Có mặt</th>
                  <th className="text-center p-3 font-semibold text-gray-500">Vắng</th>
                  <th className="text-center p-3 font-semibold text-gray-500">Có phép</th>
                  <th className="text-center p-3 font-semibold text-gray-500">Đi trễ</th>
                  <th className="text-center p-3 font-semibold text-gray-500">Tổng</th>
                  <th className="text-left p-3 font-semibold text-gray-500">Tỷ lệ</th>
                </tr>
              </thead>
              <tbody>
                {d.studentStats.map((s, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{s.name}</td>
                    <td className="p-3">{s.className}</td>
                    <td className="p-3 text-center text-green-600 font-semibold">{s.present}</td>
                    <td className="p-3 text-center text-red-600 font-semibold">{s.absent}</td>
                    <td className="p-3 text-center text-blue-600 font-semibold">{s.excused}</td>
                    <td className="p-3 text-center text-yellow-600 font-semibold">{s.late}</td>
                    <td className="p-3 text-center">{s.total}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${s.attendanceRate}%`, backgroundColor: s.attendanceRate >= 90 ? '#22c55e' : s.attendanceRate >= 75 ? '#f59e0b' : '#ef4444' }} />
                        </div>
                        <span className="text-xs font-semibold" style={{ color: s.attendanceRate >= 90 ? '#22c55e' : s.attendanceRate >= 75 ? '#f59e0b' : '#ef4444' }}>{s.attendanceRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderStudents = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-3 sm:p-5 border-b flex flex-col gap-3">
        <h3 className="font-bold text-sm sm:text-base"> Danh sách Học sinh</h3>
        <div className="flex gap-2 items-center w-full">
          <div className="relative flex-1 min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Tìm học sinh..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 pr-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-amber-500 outline-none w-full" />
          </div>
          <button className={`${btnPrimary} flex items-center gap-1 flex-shrink-0`} onClick={() => setStudentModal({ open: true, editing: false, data: { ...emptyStudent } })}>
            <Plus size={14} /> <span className="hidden sm:inline">Thêm</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-2 sm:p-3 font-semibold text-gray-500 text-xs sm:text-sm">ID</th>
              <th className="text-left p-2 sm:p-3 font-semibold text-gray-500 text-xs sm:text-sm">Họ tên</th>
              <th className="text-left p-2 sm:p-3 font-semibold text-gray-500 text-xs sm:text-sm hidden sm:table-cell">Ngày sinh</th>
              <th className="text-left p-2 sm:p-3 font-semibold text-gray-500 text-xs sm:text-sm hidden md:table-cell">Giới tính</th>
              <th className="text-left p-2 sm:p-3 font-semibold text-gray-500 text-xs sm:text-sm hidden lg:table-cell">SĐT</th>
              <th className="text-left p-2 sm:p-3 font-semibold text-gray-500 text-xs sm:text-sm hidden lg:table-cell">Email</th>
              <th className="text-left p-2 sm:p-3 font-semibold text-gray-500 text-xs sm:text-sm">Lớp</th>
              <th className="text-left p-2 sm:p-3 font-semibold text-gray-500 text-xs sm:text-sm">Trạng thái</th>
              <th className="text-center p-2 sm:p-3 font-semibold text-gray-500 text-xs sm:text-sm"></th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="p-3 text-gray-500">{s.studentId}</td>
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3">{formatDate(s.birthDate)}</td>
                <td className="p-3">{s.gender}</td>
                <td className="p-3">{s.phone}</td>
                <td className="p-3">{s.email}</td>
                <td className="p-3">{s.className}</td>
                <td className="p-3"><StatusBadge status={s.status} /></td>
                <td className="p-3 text-center">
                  <div className="flex justify-center gap-1">
                    <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setStudentModal({ open: true, editing: true, data: { studentId: s.studentId, name: s.name, birthDate: s.birthDate || '', gender: s.gender, phone: s.phone, email: s.email, address: s.address, className: s.className, note: s.note, status: s.status } })}><Edit size={14} /></button>
                    <button className="p-1 hover:bg-red-100 rounded text-red-500" onClick={() => deleteStudent(s.studentId)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-gray-400">Chưa có dữ liệu</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderClasses = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-3 sm:p-5 border-b flex justify-between items-center gap-2">
        <h3 className="font-bold text-sm sm:text-base"> Danh sách Lớp học</h3>
        <button className={`${btnPrimary} flex items-center gap-1 text-xs sm:text-sm`} onClick={() => setClassModal({ open: true, editing: false, data: { ...emptyClass } })}>
          <Plus size={14} /> <span className="hidden sm:inline">Thêm lớp</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm min-w-[600px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 font-semibold text-gray-500">ID</th>
              <th className="text-left p-3 font-semibold text-gray-500">Tên lớp</th>
              <th className="text-left p-3 font-semibold text-gray-500">Trình độ</th>
              <th className="text-left p-3 font-semibold text-gray-500">Giáo viên</th>
              <th className="text-center p-3 font-semibold text-gray-500">Sĩ số tối đa</th>
              <th className="text-left p-3 font-semibold text-gray-500">Học phí/buổi</th>
              <th className="text-center p-3 font-semibold text-gray-500">Sĩ số hiện tại</th>
              <th className="text-center p-3 font-semibold text-gray-500">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((c, i) => {
              const count = students.filter(s => s.className === c.name).length;
              return (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-gray-500">{c.classId}</td>
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3"><LevelBadge level={c.level} /></td>
                  <td className="p-3">{c.teacher}</td>
                  <td className="p-3 text-center">{c.maxStudents}</td>
                  <td className="p-3">{formatCurrency(c.feePerSession)}</td>
                  <td className="p-3 text-center">{count}/{c.maxStudents}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setClassModal({ open: true, editing: true, data: { classId: c.classId, name: c.name, level: c.level, teacher: c.teacher, maxStudents: c.maxStudents, feePerSession: c.feePerSession, note: c.note } })}><Edit size={14} /></button>
                      <button className="p-1 hover:bg-red-100 rounded text-red-500" onClick={() => deleteClassItem(c.classId)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSchedule = () => {
    const monthStart = startOfMonth(scheduleMonth);
    const monthEnd = endOfMonth(scheduleMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDay = monthStart.getDay();
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const getScheduleClass = (name: string) => {
      if (name.includes('Ngữ Văn')) return 'bg-blue-100 text-blue-700';
      if (name.includes('Toán')) return 'bg-green-100 text-green-700';
      if (name.includes('Anh')) return 'bg-yellow-100 text-yellow-700';
      return 'bg-gray-100 text-gray-600';
    };
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-3 sm:p-5 border-b flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setScheduleMonth(new Date(scheduleMonth.getFullYear(), scheduleMonth.getMonth() - 1))} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft size={18} /></button>
            <h3 className="font-bold">{format(scheduleMonth, 'MMMM yyyy')}</h3>
            <button onClick={() => setScheduleMonth(new Date(scheduleMonth.getFullYear(), scheduleMonth.getMonth() + 1))} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight size={18} /></button>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className={selectClass}>
              <option value="">Tất cả lớp</option>
              {classes.map(c => <option key={c.classId} value={c.name}>{c.name}</option>)}
            </select>
            <button className={`${btnPrimary} flex items-center gap-1`} onClick={() => setScheduleModal({ open: true, data: { ...emptySchedule } })}>
              <Plus size={14} /> Thêm lịch
            </button>
          </div>
        </div>
        <div className="p-2 sm:p-4">
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {dayNames.map(d => <div key={d} className="text-center py-1 sm:py-2 text-[10px] sm:text-sm font-semibold text-gray-500 bg-gray-50 rounded">{d}</div>)}
            {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} className="min-h-[60px] sm:min-h-[100px] bg-gray-50 rounded" />)}
            {days.map((day, i) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const daySchedules = schedules.filter(s => s.date === dateStr);
              const isTodayDate = isToday(day);
              return (
                <div key={i} className={`min-h-[60px] sm:min-h-[100px] p-0.5 sm:p-1 border rounded text-[10px] sm:text-xs ${isTodayDate ? 'bg-amber-50 border-amber-300' : 'bg-white'}`}>
                  <div className="text-xs sm:text-sm font-semibold mb-0 sm:mb-1">{format(day, 'dd')}</div>
                  {daySchedules.map(s => (
                    <div key={s.id} className={`p-0.5 sm:p-1 rounded mb-0 sm:mb-1 truncate text-[8px] sm:text-xs ${getScheduleClass(s.className)} hidden sm:block`} title={`${s.className} - ${s.startTime}-${s.endTime} - ${s.teacher}`}>
                      {s.className.length > 12 ? s.className.substring(0, 12) + '..' : s.className}
                    </div>
                  ))}
                  {daySchedules.length > 0 && <div className="sm:hidden text-[8px] text-amber-600">{daySchedules.length} lớp</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderAttendance = () => {
    const monthStart = startOfMonth(attendanceMonth);
    const monthEnd = endOfMonth(attendanceMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const filteredStudents = selectedClass ? students.filter(s => s.className === selectedClass) : students;

    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-3 sm:p-5 border-b flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base"> Bảng điểm danh</h3>
              <div className="flex items-center gap-1">
                <button onClick={() => setAttendanceMonth(new Date(attendanceMonth.getFullYear(), attendanceMonth.getMonth() - 1))} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={14} className="sm:w-4 sm:h-4" /></button>
                <span className="text-xs sm:text-sm font-semibold">{format(attendanceMonth, 'MM/yyyy')}</span>
                <button onClick={() => setAttendanceMonth(new Date(attendanceMonth.getFullYear(), attendanceMonth.getMonth() + 1))} className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={14} className="sm:w-4 sm:h-4" /></button>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap items-center w-full">
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className={`${selectClass} flex-1 min-w-[100px] text-xs sm:text-sm`}>
              <option value="">Tất cả lớp</option>
              {classes.map(c => <option key={c.classId} value={c.name}>{c.name}</option>)}
            </select>
            <button className={`${btnSuccess} flex items-center gap-1 text-xs sm:text-sm flex-shrink-0`} onClick={() => {
              const data: Record<string, string> = {};
              filteredStudents.forEach(s => { data[s.studentId] = 'Có mặt'; });
              setQuickAttData(data);
              setQuickAttModal(true);
            }}>
              <CheckSquare size={14} /> <span className="hidden sm:inline">Điểm danh nhanh</span><span className="sm:hidden">Nhanh</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full text-xs sm:text-sm min-w-[600px] sm:min-w-[800px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-2 font-semibold text-gray-500 sticky left-0 bg-gray-50 z-10 min-w-[160px]">Học sinh</th>
                {days.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayOfWeek = getDayOfWeek(dateStr);
                  return (
                    <th key={dateStr} className="p-2 text-center font-semibold text-gray-500 text-xs min-w-[36px]">
                      <div className="text-gray-400">{dayOfWeek}</div>
                      <div>{format(day, 'dd')}</div>
                    </th>
                  );
                })}
                <th className="p-2 text-center font-semibold text-gray-500 min-w-[50px]">Tổng</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(s => {
                const studentAtt = attendance.filter(a => a.studentId === s.studentId);
                const presentCount = studentAtt.filter(a => a.status === 'Có mặt').length;
                return (
                  <tr key={s.studentId} className="border-t hover:bg-gray-50">
                    <td className="p-2 font-medium sticky left-0 bg-white z-10">{s.name}</td>
                    {days.map(day => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const record = attendance.find(a => a.studentId === s.studentId && a.date === dateStr);
                      if (record) {
                        const colors = STATUS_COLORS[record.status] || { bg: 'bg-gray-100', icon: '' };
                        return (
                          <td key={dateStr} className="p-1 text-center">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto cursor-pointer hover:scale-110 transition-transform ${colors.bg}`}
                              onClick={() => setAttCellModal({ open: true, date: dateStr, studentId: s.studentId, status: record.status, note: record.note || '' })}
                              title={`${record.status}${record.note ? ': ' + record.note : ''}`}
                            >
                              {colors.icon}
                            </div>
                          </td>
                        );
                      }
                      return (
                        <td key={dateStr} className="p-1 text-center">
                          <div
                            className="w-8 h-8 rounded-lg bg-gray-100 mx-auto cursor-pointer hover:bg-gray-200 transition-colors"
                            onClick={() => setAttCellModal({ open: true, date: dateStr, studentId: s.studentId, status: '', note: '' })}
                          />
                        </td>
                      );
                    })}
                    <td className="p-2 text-center font-semibold text-green-600">{presentCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex gap-4 p-3 bg-gray-50 border-t text-sm">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500" /> Có mặt</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500" /> Vắng</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500" /> Có phép</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500" /> Đi trễ</span>
          <span className="text-gray-400 ml-2">Click vào ô để điểm danh</span>
        </div>
      </div>
    );
  };

  const renderEvaluations = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b flex justify-between items-center">
        <h3 className="font-bold">⭐ Đánh giá Học sinh</h3>
        <button className={`${btnPrimary} flex items-center gap-1`} onClick={() => setEvaluationModal({ open: true, data: { ...emptyEvaluation, date: new Date().toISOString().split('T')[0] } })}>
          <Plus size={14} /> Thêm đánh giá
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm min-w-[600px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 font-semibold text-gray-500">ID</th>
              <th className="text-left p-3 font-semibold text-gray-500">Học sinh</th>
              <th className="text-left p-3 font-semibold text-gray-500">Lớp</th>
              <th className="text-left p-3 font-semibold text-gray-500">Ngày</th>
              <th className="text-center p-3 font-semibold text-gray-500">Chuyên cần</th>
              <th className="text-center p-3 font-semibold text-gray-500">Kiểm tra</th>
              <th className="text-center p-3 font-semibold text-gray-500">Thi</th>
              <th className="text-left p-3 font-semibold text-gray-500">Nhận xét</th>
              <th className="text-center p-3 font-semibold text-gray-500">Xếp loại</th>
              <th className="text-center p-3 font-semibold text-gray-500">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.map((e, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="p-3 text-gray-500">{e.evaluationId}</td>
                <td className="p-3 font-medium">{e.studentName}</td>
                <td className="p-3">{e.className}</td>
                <td className="p-3">{formatDate(e.date)}</td>
                <td className="p-3 text-center">{e.attendScore}</td>
                <td className="p-3 text-center">{e.testScore}</td>
                <td className="p-3 text-center">{e.examScore}</td>
                <td className="p-3 text-xs max-w-[200px] truncate">{e.note}</td>
                <td className="p-3 text-center font-semibold" style={{ color: GRADE_COLORS[e.grade] || '#64748b' }}>{e.grade}</td>
                <td className="p-3 text-center">
                  <button className="p-1 hover:bg-red-100 rounded text-red-500" onClick={() => deleteEvaluationItem(e.evaluationId)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {evaluations.length === 0 && <tr><td colSpan={10} className="p-8 text-center text-gray-400">Chưa có dữ liệu</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGrades = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b flex justify-between items-center">
        <h3 className="font-bold">📝 Bảng Điểm</h3>
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className={selectClass}>
          <option value="">Tất cả lớp</option>
          {classes.map(c => <option key={c.classId} value={c.name}>{c.name}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm min-w-[600px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 font-semibold text-gray-500">Học sinh</th>
              <th className="text-left p-3 font-semibold text-gray-500">Lớp</th>
              <th className="text-center p-3 font-semibold text-gray-500">Chuyên cần</th>
              <th className="text-center p-3 font-semibold text-gray-500">Kiểm tra</th>
              <th className="text-center p-3 font-semibold text-gray-500">Thi</th>
              <th className="text-center p-3 font-semibold text-gray-500">Trung bình</th>
              <th className="text-center p-3 font-semibold text-gray-500">Xếp loại</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.map((e, i) => {
              const avg = Math.round((e.attendScore || 0) * 0.3 + (e.testScore || 0) * 0.3 + (e.examScore || 0) * 0.4);
              return (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{e.studentName}</td>
                  <td className="p-3">{e.className}</td>
                  <td className="p-3 text-center">{e.attendScore}</td>
                  <td className="p-3 text-center">{e.testScore}</td>
                  <td className="p-3 text-center">{e.examScore}</td>
                  <td className="p-3 text-center font-bold">{avg}</td>
                  <td className="p-3 text-center font-semibold" style={{ color: GRADE_COLORS[e.grade] || '#64748b' }}>{e.grade}</td>
                </tr>
              );
            })}
            {evaluations.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-400">Chưa có dữ liệu</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBills = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-3 sm:p-5 border-b flex flex-col gap-3">
        <h3 className="font-bold"> Hoá đơn</h3>
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex items-center gap-2">
            <button onClick={() => setAttendanceMonth(new Date(attendanceMonth.getFullYear(), attendanceMonth.getMonth() - 1))} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={16} /></button>
            <span className="text-sm font-semibold">{format(attendanceMonth, 'MM/yyyy')}</span>
            <button onClick={() => setAttendanceMonth(new Date(attendanceMonth.getFullYear(), attendanceMonth.getMonth() + 1))} className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={16} /></button>
          </div>
          <button className={`${btnSuccess} flex items-center gap-1`} onClick={generateBillsFromAttendance}>
            <DollarSign size={14} /> Tạo hoá đơn từ điểm danh
          </button>
          <button className={`${btnPrimary} flex items-center gap-1`} onClick={() => {
            const monthStr = format(attendanceMonth, 'MM/yyyy');
            setBillModal({ open: true, data: { ...emptyBill, month: monthStr } });
          }}>
            <Plus size={14} /> Thêm hoá đơn
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm min-w-[600px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 font-semibold text-gray-500">ID</th>
              <th className="text-left p-3 font-semibold text-gray-500">Học sinh</th>
              <th className="text-left p-3 font-semibold text-gray-500">Lớp</th>
              <th className="text-left p-3 font-semibold text-gray-500">Tháng</th>
              <th className="text-center p-3 font-semibold text-gray-500">Buổi</th>
              <th className="text-right p-3 font-semibold text-gray-500">Thành tiền</th>
              <th className="text-right p-3 font-semibold text-gray-500">Đã thanh toán</th>
              <th className="text-right p-3 font-semibold text-gray-500">Còn nợ</th>
              <th className="text-center p-3 font-semibold text-gray-500">Trạng thái</th>
              <th className="text-center p-3 font-semibold text-gray-500">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((b, i) => {
              const debt = (b.amount || 0) - (b.paid || 0);
              return (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-gray-500">{b.billId}</td>
                  <td className="p-3 font-medium">{b.studentName}</td>
                  <td className="p-3">{b.className}</td>
                  <td className="p-3">{b.month}</td>
                  <td className="p-3 text-center">{b.sessions}</td>
                  <td className="p-3 text-right">{formatCurrency(b.amount)}</td>
                  <td className="p-3 text-right">{formatCurrency(b.paid)}</td>
                  <td className="p-3 text-right font-semibold" style={{ color: debt > 0 ? '#ef4444' : '#22c55e' }}>{formatCurrency(debt)}</td>
                  <td className="p-3 text-center"><StatusBadge status={b.status} /></td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-1">
                      {b.status !== 'Đã thanh toán' && <button className="p-1 hover:bg-green-100 rounded text-green-600" onClick={() => payBill(b)} title="Thanh toán">💵</button>}
                      <button className="p-1 hover:bg-red-100 rounded text-red-500" onClick={() => deleteBillItem(b.billId)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {bills.length === 0 && <tr><td colSpan={10} className="p-8 text-center text-gray-400">Chưa có dữ liệu. Click "Tạo hoá đơn từ điểm danh" để tự động tạo.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b flex justify-between items-center">
        <h3 className="font-bold">👤 Người dùng</h3>
        <button className={`${btnPrimary} flex items-center gap-1`} onClick={() => setUserModal({ open: true, editing: false, data: { ...emptyUser } })}>
          <Plus size={14} /> Thêm người dùng
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm min-w-[600px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 font-semibold text-gray-500">ID</th>
              <th className="text-left p-3 font-semibold text-gray-500">Tên đăng nhập</th>
              <th className="text-left p-3 font-semibold text-gray-500">Họ tên</th>
              <th className="text-left p-3 font-semibold text-gray-500">Vai trò</th>
              <th className="text-left p-3 font-semibold text-gray-500">Email</th>
              <th className="text-left p-3 font-semibold text-gray-500">SĐT</th>
              <th className="text-center p-3 font-semibold text-gray-500">Trạng thái</th>
              <th className="text-center p-3 font-semibold text-gray-500">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {usersList.map((u, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="p-3 text-gray-500">{u.userId}</td>
                <td className="p-3">{u.username}</td>
                <td className="p-3 font-medium">{u.fullName}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.phone}</td>
                <td className="p-3 text-center"><StatusBadge status={u.status} /></td>
                <td className="p-3 text-center">
                  <div className="flex justify-center gap-1">
                    <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setUserModal({ open: true, editing: true, data: { userId: u.userId, username: u.username, password: u.password, fullName: u.fullName, role: u.role, email: u.email, phone: u.phone, status: u.status } })}><Edit size={14} /></button>
                    <button className="p-1 hover:bg-red-100 rounded text-red-500" onClick={() => deleteUserItem(u.userId)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {usersList.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-gray-400">Chưa có dữ liệu</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-lg">
      <h3 className="font-bold text-lg mb-6">⚙️ Cài đặt Trung tâm</h3>
      <div className="space-y-4">
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">Tên trung tâm</label>
          <input type="text" className={inputClass} value={settings.center_name || ''} onChange={e => setSettings({ ...settings, center_name: e.target.value })} />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">Địa chỉ</label>
          <input type="text" className={inputClass} value={settings.center_address || ''} onChange={e => setSettings({ ...settings, center_address: e.target.value })} />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">Điện thoại</label>
          <input type="text" className={inputClass} value={settings.center_phone || ''} onChange={e => setSettings({ ...settings, center_phone: e.target.value })} />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">Năm học</label>
          <input type="text" className={inputClass} value={settings.school_year || ''} onChange={e => setSettings({ ...settings, school_year: e.target.value })} />
        </div>
        <button className={btnPrimary} onClick={saveSettingsData}>💾 Lưu cài đặt</button>
      </div>
    </div>
  );

  const renderRevenue = () => {
    if (!revenueData) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" /></div>;
    const r = revenueData;
    const maxMonthAmount = Math.max(...r.byMonth.map(m => m.amount), 1);
    const statusColors: Record<string, string> = {
      'Đã thanh toán': '#22c55e',
      'Chưa thanh toán': '#ef4444',
      'Thanh toán một phần': '#f59e0b',
    };
    const totalForStatus = r.byStatus.reduce((s, x) => s + x.count, 0) || 1;

    return (
      <div className="space-y-4 lg:space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          {[
            { icon: '💰', label: 'Tổng doanh thu', value: formatCurrency(r.stats.totalAmount), color: 'bg-amber-100' },
            { icon: '✅', label: 'Đã thu', value: formatCurrency(r.stats.totalPaid), color: 'bg-green-100' },
            { icon: '❌', label: 'Còn nợ', value: formatCurrency(r.stats.totalDebt), color: 'bg-red-100' },
            { icon: '📊', label: 'Tỷ lệ thu', value: `${r.stats.collectionRate}%`, color: 'bg-blue-100' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-3 sm:p-5 flex items-center gap-2 sm:gap-4 shadow-sm">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${s.color} flex items-center justify-center text-lg sm:text-2xl flex-shrink-0`}>{s.icon}</div>
              <div className="min-w-0">
                <div className="text-sm sm:text-lg font-bold leading-tight break-all">{s.value}</div>
                <div className="text-xs sm:text-sm text-gray-500 truncate">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue by month chart + status donut */}
        <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm md:col-span-2 overflow-x-auto">
            <h3 className="font-bold mb-4 text-sm sm:text-base flex items-center gap-2"><TrendingUp size={18} /> Doanh thu theo tháng</h3>
            {r.byMonth.length === 0 ? (
              <p className="text-center text-gray-500 py-10">Chưa có dữ liệu</p>
            ) : (
              <div className="min-w-[400px]">
                <div className="flex items-end gap-3 h-48 pt-4">
                  {r.byMonth.map((m, i) => {
                    const heightPct = (m.amount / maxMonthAmount) * 100;
                    const paidPct = m.amount > 0 ? (m.paid / m.amount) * 100 : 0;
                    return (
                      <div key={i} className="flex flex-col items-center gap-1 flex-1">
                        <div className="text-xs font-semibold text-gray-700">{formatCurrency(m.amount).replace('₫', 'đ')}</div>
                        <div className="w-full flex flex-col justify-end h-36 relative">
                          <div className="w-full bg-gray-200 rounded-t overflow-hidden" style={{ height: `${heightPct}%` }}>
                            <div className="w-full bg-green-500 transition-all" style={{ height: `${paidPct}%` }} />
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">{m.month}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 mt-3 text-xs text-gray-500 justify-center">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500" /> Đã thu</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-200" /> Chưa thu</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-sm sm:text-base">Trạng thái thanh toán</h3>
            {r.byStatus.length === 0 ? (
              <p className="text-center text-gray-500 py-10">Chưa có dữ liệu</p>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <svg width="160" height="160" viewBox="0 0 160 160">
                  {(() => {
                    let cumulative = 0;
                    const radius = 60;
                    const circumference = 2 * Math.PI * radius;
                    return r.byStatus.map((s, i) => {
                      const percent = (s.count / totalForStatus) * 100;
                      const dashArray = `${(percent / 100) * circumference} ${circumference}`;
                      const dashOffset = -(cumulative / 100) * circumference;
                      cumulative += percent;
                      return <circle key={i} cx="80" cy="80" r={radius} fill="none" stroke={statusColors[s.status] || '#94a3b8'} strokeWidth="20" strokeDasharray={dashArray} strokeDashoffset={dashOffset} transform="rotate(-90 80 80)" />;
                    });
                  })()}
                  <text x="80" y="78" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#1e293b">{r.stats.billCount}</text>
                  <text x="80" y="96" textAnchor="middle" fontSize="11" fill="#64748b">hoá đơn</text>
                </svg>
                <div className="flex flex-col gap-2 w-full">
                  {r.byStatus.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors[s.status] || '#94a3b8' }} />
                        <span>{s.status}</span>
                      </div>
                      <span className="font-semibold">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Revenue by class table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2"><DollarSign size={18} /> Doanh thu theo lớp</h3>
            <div className="flex gap-2">
              <button className={`${btnSecondary} flex items-center gap-1`} onClick={() => window.print()}><Printer size={14} /> In</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[600px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-semibold text-gray-500">Lớp</th>
                  <th className="text-center p-3 font-semibold text-gray-500">Số HĐ</th>
                  <th className="text-center p-3 font-semibold text-gray-500">Buổi</th>
                  <th className="text-right p-3 font-semibold text-gray-500">Tổng doanh thu</th>
                  <th className="text-right p-3 font-semibold text-gray-500">Đã thu</th>
                  <th className="text-right p-3 font-semibold text-gray-500">Còn nợ</th>
                  <th className="text-left p-3 font-semibold text-gray-500">Tỷ lệ thu</th>
                </tr>
              </thead>
              <tbody>
                {r.byClass.map((c, i) => {
                  const rate = c.amount > 0 ? Math.round((c.paid / c.amount) * 100) : 0;
                  return (
                    <tr key={i} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{c.className}</td>
                      <td className="p-3 text-center">{c.count}</td>
                      <td className="p-3 text-center">{c.sessions}</td>
                      <td className="p-3 text-right font-semibold">{formatCurrency(c.amount)}</td>
                      <td className="p-3 text-right text-green-600">{formatCurrency(c.paid)}</td>
                      <td className="p-3 text-right text-red-600">{formatCurrency(c.debt)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${rate}%`, backgroundColor: rate >= 80 ? '#22c55e' : rate >= 50 ? '#f59e0b' : '#ef4444' }} />
                          </div>
                          <span className="text-xs font-semibold" style={{ color: rate >= 80 ? '#22c55e' : rate >= 50 ? '#f59e0b' : '#ef4444' }}>{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {r.byClass.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-400">Chưa có dữ liệu</td></tr>}
              </tbody>
              {r.byClass.length > 0 && (
                <tfoot>
                  <tr className="bg-amber-50 font-bold">
                    <td className="p-3">Tổng cộng</td>
                    <td className="p-3 text-center">{r.stats.billCount}</td>
                    <td className="p-3 text-center">{r.byClass.reduce((s, c) => s + c.sessions, 0)}</td>
                    <td className="p-3 text-right">{formatCurrency(r.stats.totalAmount)}</td>
                    <td className="p-3 text-right text-green-700">{formatCurrency(r.stats.totalPaid)}</td>
                    <td className="p-3 text-right text-red-700">{formatCurrency(r.stats.totalDebt)}</td>
                    <td className="p-3 text-amber-700">{r.stats.collectionRate}%</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Recent bills */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b flex justify-between items-center">
            <h3 className="font-bold">📋 Hoá đơn gần đây</h3>
            <button className={`${btnSecondary} text-xs`} onClick={() => setCurrentPage('bills')}>Xem tất cả →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[600px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-semibold text-gray-500">Học sinh</th>
                  <th className="text-left p-3 font-semibold text-gray-500">Lớp</th>
                  <th className="text-left p-3 font-semibold text-gray-500">Tháng</th>
                  <th className="text-right p-3 font-semibold text-gray-500">Thành tiền</th>
                  <th className="text-right p-3 font-semibold text-gray-500">Đã thu</th>
                  <th className="text-center p-3 font-semibold text-gray-500">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {bills.slice(0, 8).map((b, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{b.studentName}</td>
                    <td className="p-3">{b.className}</td>
                    <td className="p-3">{b.month}</td>
                    <td className="p-3 text-right">{formatCurrency(b.amount)}</td>
                    <td className="p-3 text-right text-green-600">{formatCurrency(b.paid)}</td>
                    <td className="p-3 text-center"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
                {bills.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">Chưa có dữ liệu</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return renderDashboard();
      case 'students': return renderStudents();
      case 'classes': return renderClasses();
      case 'schedule': return renderSchedule();
      case 'attendance': return renderAttendance();
      case 'evaluation': return renderEvaluations();
      case 'grades': return renderGrades();
      case 'bills': return renderBills();
      case 'revenue': return renderRevenue();
      case 'users': return renderUsers();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  };

  // Modal components
  const Modal = ({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg mx-3 sm:mx-0 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><X size={16} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );

  const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold mb-1 text-gray-700">{label}</label>
      {children}
    </div>
  );

  const renderStudentModal = () => {
    if (!studentModal.open) return null;
    const d = studentModal.data;
    const setD = (updates: Partial<StudentForm>) => setStudentModal({ ...studentModal, data: { ...d, ...updates } });
    return (
      <Modal title={studentModal.editing ? 'Sửa Học sinh' : 'Thêm Học sinh'} onClose={() => setStudentModal({ ...studentModal, open: false })}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Họ tên *"><input className={inputClass} value={d.name} onChange={e => setD({ name: e.target.value })} placeholder="Nhập họ tên" /></FormField>
          <FormField label="Ngày sinh"><input type="date" className={inputClass} value={d.birthDate} onChange={e => setD({ birthDate: e.target.value })} /></FormField>
          <FormField label="Giới tính">
            <select className={selectClass} value={d.gender} onChange={e => setD({ gender: e.target.value })}>
              <option value="Nam">Nam</option><option value="Nữ">Nữ</option>
            </select>
          </FormField>
          <FormField label="SĐT"><input className={inputClass} value={d.phone} onChange={e => setD({ phone: e.target.value })} placeholder="09xxxxxxxx" /></FormField>
        </div>
        <FormField label="Email"><input type="email" className={inputClass} value={d.email} onChange={e => setD({ email: e.target.value })} placeholder="email@example.com" /></FormField>
        <FormField label="Địa chỉ"><input className={inputClass} value={d.address} onChange={e => setD({ address: e.target.value })} placeholder="Nhập địa chỉ" /></FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Lớp *">
            <select className={selectClass} value={d.className} onChange={e => setD({ className: e.target.value })}>
              <option value="">-- Chọn lớp --</option>
              {classes.map(c => <option key={c.classId} value={c.name}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Trạng thái">
            <select className={selectClass} value={d.status} onChange={e => setD({ status: e.target.value })}>
              <option value="Đang học">Đang học</option><option value="Nghỉ học">Nghỉ học</option><option value="Bảo lưu">Bảo lưu</option>
            </select>
          </FormField>
        </div>
        <FormField label="Ghi chú"><textarea className={inputClass} value={d.note} onChange={e => setD({ note: e.target.value })} rows={2} placeholder="Ghi chú..." /></FormField>
        <div className="flex justify-end gap-2 mt-4">
          <button className={btnSecondary} onClick={() => setStudentModal({ ...studentModal, open: false })}>Huỷ</button>
          <button className={btnPrimary} onClick={saveStudent}>💾 Lưu</button>
        </div>
      </Modal>
    );
  };

  const renderClassModal = () => {
    if (!classModal.open) return null;
    const d = classModal.data;
    const setD = (updates: Partial<ClassForm>) => setClassModal({ ...classModal, data: { ...d, ...updates } });
    return (
      <Modal title={classModal.editing ? 'Sửa Lớp' : 'Thêm Lớp'} onClose={() => setClassModal({ ...classModal, open: false })}>
        <FormField label="Tên lớp *"><input className={inputClass} value={d.name} onChange={e => setD({ name: e.target.value })} placeholder="VD: English A1" /></FormField>
        <FormField label="Trình độ">
          <select className={selectClass} value={d.level} onChange={e => setD({ level: e.target.value })}>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Giáo viên"><input className={inputClass} value={d.teacher} onChange={e => setD({ teacher: e.target.value })} placeholder="Tên giáo viên" /></FormField>
          <FormField label="Sĩ số tối đa"><input type="number" className={inputClass} value={d.maxStudents} onChange={e => setD({ maxStudents: parseInt(e.target.value) || 25 })} /></FormField>
        </div>
        <FormField label="Học phí/buổi (VNĐ)"><input type="number" className={inputClass} value={d.feePerSession} onChange={e => setD({ feePerSession: parseInt(e.target.value) || 150000 })} /></FormField>
        <FormField label="Ghi chú"><textarea className={inputClass} value={d.note} onChange={e => setD({ note: e.target.value })} rows={2} /></FormField>
        <div className="flex justify-end gap-2 mt-4">
          <button className={btnSecondary} onClick={() => setClassModal({ ...classModal, open: false })}>Huỷ</button>
          <button className={btnPrimary} onClick={saveClassItem}> Lưu</button>
        </div>
      </Modal>
    );
  };

  const renderScheduleModal = () => {
    if (!scheduleModal.open) return null;
    const d = scheduleModal.data;
    const setD = (updates: Partial<ScheduleForm>) => setScheduleModal({ ...scheduleModal, data: { ...d, ...updates } });
    return (
      <Modal title="Thêm Lịch học" onClose={() => setScheduleModal({ open: false, data: { ...emptySchedule } })}>
        <FormField label="Lớp *">
          <select className={selectClass} value={d.className} onChange={e => setD({ className: e.target.value })}>
            <option value="">-- Chọn lớp --</option>
            {classes.map(c => <option key={c.classId} value={c.name}>{c.name}</option>)}
          </select>
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Ngày *"><input type="date" className={inputClass} value={d.date} onChange={e => setD({ date: e.target.value })} /></FormField>
          <FormField label="Giáo viên"><input className={inputClass} value={d.teacher} onChange={e => setD({ teacher: e.target.value })} placeholder="Tên giáo viên" /></FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Giờ bắt đầu"><input type="time" className={inputClass} value={d.startTime} onChange={e => setD({ startTime: e.target.value })} /></FormField>
          <FormField label="Giờ kết thúc"><input type="time" className={inputClass} value={d.endTime} onChange={e => setD({ endTime: e.target.value })} /></FormField>
        </div>
        <FormField label="Phòng học"><input className={inputClass} value={d.room} onChange={e => setD({ room: e.target.value })} placeholder="VD: P1" /></FormField>
        <div className="flex justify-end gap-2 mt-4">
          <button className={btnSecondary} onClick={() => setScheduleModal({ open: false, data: { ...emptySchedule } })}>Huỷ</button>
          <button className={btnPrimary} onClick={saveScheduleItem}>💾 Lưu</button>
        </div>
      </Modal>
    );
  };

  const renderQuickAttModal = () => {
    if (!quickAttModal) return null;
    const filteredStudents = selectedClass ? students.filter(s => s.className === selectedClass) : students;
    return (
      <Modal title="⚡ Điểm danh nhanh" onClose={() => setQuickAttModal(false)}>
        <div className="flex gap-2 mb-4 flex-wrap">
          <button className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-semibold" onClick={() => {
            const newData: Record<string, string> = {};
            filteredStudents.forEach(s => newData[s.studentId] = 'Có mặt');
            setQuickAttData(newData);
          }}>✅ Tất cả có mặt</button>
          <button className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-semibold" onClick={() => {
            const newData: Record<string, string> = {};
            filteredStudents.forEach(s => newData[s.studentId] = 'Vắng');
            setQuickAttData(newData);
          }}>❌ Tất cả vắng</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-80 overflow-y-auto">
          {filteredStudents.map(s => {
            const status = quickAttData[s.studentId] || 'Có mặt';
            const colors = STATUS_COLORS[status] || { bg: 'bg-gray-100' };
            return (
              <div key={s.studentId} className={`p-3 border-2 rounded-xl cursor-pointer text-center transition-all ${colors.bg} ${status !== 'Có mặt' ? 'border-amber-400' : 'border-gray-200'}`}
                onClick={() => {
                  const statuses = ['Có mặt', 'Vắng', 'Có phép', 'Đi trễ'];
                  const idx = (statuses.indexOf(status) + 1) % 4;
                  setQuickAttData({ ...quickAttData, [s.studentId]: statuses[idx] });
                }}>
                <div className="text-xs font-medium truncate">{s.name}</div>
                <div className="text-lg">{STATUS_COLORS[status]?.icon || '✅'}</div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button className={btnSecondary} onClick={() => setQuickAttModal(false)}>Huỷ</button>
          <button className={btnSuccess} onClick={saveQuickAtt}>💾 Lưu điểm danh</button>
        </div>
      </Modal>
    );
  };

  const renderAttCellModal = () => {
    if (!attCellModal.open) return null;
    const student = students.find(s => s.studentId === attCellModal.studentId);
    return (
      <Modal title={`Điểm danh - ${student?.name || ''} - ${formatDate(attCellModal.date)}`} onClose={() => setAttCellModal({ open: false, date: '', studentId: '', status: '', note: '' })}>
        <FormField label="Trạng thái">
          <div className="grid grid-cols-2 gap-2">
            {['Có mặt', 'Vắng', 'Có phép', 'Đi trễ'].map(status => {
              const colors = STATUS_COLORS[status];
              const isSelected = attCellModal.status === status;
              return (
                <button
                  key={status}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${isSelected ? 'border-amber-500 bg-amber-50' : 'border-gray-200'} ${colors?.bg}`}
                  onClick={() => setAttCellModal({ ...attCellModal, status })}
                >
                  <div className="text-2xl">{colors?.icon}</div>
                  <div className="text-sm font-medium mt-1">{status}</div>
                </button>
              );
            })}
          </div>
        </FormField>
        <FormField label="Ghi chú">
          <input className={inputClass} value={attCellModal.note} onChange={e => setAttCellModal({ ...attCellModal, note: e.target.value })} placeholder="VD: Mẹ xin phép" />
        </FormField>
        <div className="flex justify-end gap-2 mt-4">
          <button className={btnSecondary} onClick={() => setAttCellModal({ open: false, date: '', studentId: '', status: '', note: '' })}>Huỷ</button>
          <button className={btnPrimary} onClick={saveCellAtt}> Lưu</button>
        </div>
      </Modal>
    );
  };

  const renderEvaluationModal = () => {
    if (!evaluationModal.open) return null;
    const d = evaluationModal.data;
    const setD = (updates: Partial<EvaluationForm>) => setEvaluationModal({ ...evaluationModal, data: { ...d, ...updates } });
    const total = Math.round(d.attendScore * 0.3 + d.testScore * 0.3 + d.examScore * 0.4);
    const grade = total >= 90 ? 'Giỏi' : total >= 75 ? 'Khá' : total >= 60 ? 'Trung bình' : 'Yếu';
    return (
      <Modal title="Thêm Đánh giá" onClose={() => setEvaluationModal({ open: false, data: { ...emptyEvaluation } })}>
        <FormField label="Học sinh *">
          <select className={selectClass} value={d.studentId} onChange={e => {
            const student = students.find(s => s.studentId === e.target.value);
            setD({ studentId: e.target.value, studentName: student?.name || '', className: student?.className || '' });
          }}>
            <option value="">-- Chọn học sinh --</option>
            {students.map(s => <option key={s.studentId} value={s.studentId}>{s.name} ({s.className})</option>)}
          </select>
        </FormField>
        <FormField label="Lớp"><input className={inputClass} value={d.className} readOnly /></FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Ngày"><input type="date" className={inputClass} value={d.date} onChange={e => setD({ date: e.target.value })} /></FormField>
          <FormField label="Xếp loại">
            <select className={selectClass} value={grade} disabled>
              {['Giỏi', 'Khá', 'Trung bình', 'Yếu'].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField label="Chuyên cần"><input type="number" min={0} max={100} className={inputClass} value={d.attendScore} onChange={e => setD({ attendScore: parseInt(e.target.value) || 0 })} /></FormField>
          <FormField label="Kiểm tra"><input type="number" min={0} max={100} className={inputClass} value={d.testScore} onChange={e => setD({ testScore: parseInt(e.target.value) || 0 })} /></FormField>
          <FormField label="Thi"><input type="number" min={0} max={100} className={inputClass} value={d.examScore} onChange={e => setD({ examScore: parseInt(e.target.value) || 0 })} /></FormField>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg mb-3">
          <div className="text-sm text-gray-500">Trung bình: <span className="font-bold text-lg" style={{ color: GRADE_COLORS[grade] }}>{total}</span></div>
        </div>
        <FormField label="Nhận xét"><textarea className={inputClass} value={d.note} onChange={e => setD({ note: e.target.value })} rows={2} placeholder="Nhận xét về học sinh..." /></FormField>
        <div className="flex justify-end gap-2 mt-4">
          <button className={btnSecondary} onClick={() => setEvaluationModal({ open: false, data: { ...emptyEvaluation } })}>Huỷ</button>
          <button className={btnPrimary} onClick={saveEvaluationItem}>💾 Lưu</button>
        </div>
      </Modal>
    );
  };

  const renderBillModal = () => {
    if (!billModal.open) return null;
    const d = billModal.data;
    const setD = (updates: Partial<BillForm>) => setBillModal({ ...billModal, data: { ...d, ...updates } });
    return (
      <Modal title="Thêm Hoá đơn" onClose={() => setBillModal({ open: false, data: { ...emptyBill } })}>
        <FormField label="Học sinh *">
          <select className={selectClass} value={d.studentId} onChange={e => {
            const student = students.find(s => s.studentId === e.target.value);
            const cls = classes.find(c => c.name === student?.className);
            setD({ studentId: e.target.value, studentName: student?.name || '', className: student?.className || '', amount: (cls?.feePerSession || 150000) * d.sessions });
          }}>
            <option value="">-- Chọn học sinh --</option>
            {students.map(s => <option key={s.studentId} value={s.studentId}>{s.name} ({s.className})</option>)}
          </select>
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Tháng"><input className={inputClass} value={d.month} onChange={e => setD({ month: e.target.value })} /></FormField>
          <FormField label="Số buổi"><input type="number" className={inputClass} value={d.sessions} onChange={e => {
            const sessions = parseInt(e.target.value) || 0;
            const cls = classes.find(c => c.name === d.className);
            setD({ sessions, amount: (cls?.feePerSession || 150000) * sessions });
          }} /></FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Thành tiền"><input type="number" className={inputClass} value={d.amount} readOnly /></FormField>
          <FormField label="Đã thanh toán"><input type="number" className={inputClass} value={d.paid} onChange={e => setD({ paid: parseInt(e.target.value) || 0 })} /></FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Ngày thanh toán"><input type="date" className={inputClass} value={d.payDate} onChange={e => setD({ payDate: e.target.value })} /></FormField>
          <FormField label="Trạng thái">
            <select className={selectClass} value={d.status} onChange={e => setD({ status: e.target.value })}>
              {['Chưa thanh toán', 'Đã thanh toán', 'Thanh toán một phần'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button className={btnSecondary} onClick={() => setBillModal({ open: false, data: { ...emptyBill } })}>Huỷ</button>
          <button className={btnPrimary} onClick={saveBillItem}>💾 Lưu</button>
        </div>
      </Modal>
    );
  };

  const renderUserModal = () => {
    if (!userModal.open) return null;
    const d = userModal.data;
    const setD = (updates: Partial<UserForm>) => setUserModal({ ...userModal, data: { ...d, ...updates } });
    return (
      <Modal title={userModal.editing ? 'Sửa Người dùng' : 'Thêm Người dùng'} onClose={() => setUserModal({ ...userModal, open: false })}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Tên đăng nhập *"><input className={inputClass} value={d.username} onChange={e => setD({ username: e.target.value })} /></FormField>
          <FormField label="Mật khẩu *"><input type="password" className={inputClass} value={d.password} onChange={e => setD({ password: e.target.value })} /></FormField>
        </div>
        <FormField label="Họ tên *"><input className={inputClass} value={d.fullName} onChange={e => setD({ fullName: e.target.value })} /></FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Vai trò">
            <select className={selectClass} value={d.role} onChange={e => setD({ role: e.target.value })}>
              {['Admin', 'Giáo viên', 'Nhân viên'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </FormField>
          <FormField label="Trạng thái">
            <select className={selectClass} value={d.status} onChange={e => setD({ status: e.target.value })}>
              <option value="Active">Active</option><option value="Inactive">Inactive</option>
            </select>
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Email"><input type="email" className={inputClass} value={d.email} onChange={e => setD({ email: e.target.value })} /></FormField>
          <FormField label="SĐT"><input className={inputClass} value={d.phone} onChange={e => setD({ phone: e.target.value })} /></FormField>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button className={btnSecondary} onClick={() => setUserModal({ ...userModal, open: false })}>Huỷ</button>
          <button className={btnPrimary} onClick={saveUserItem}>💾 Lưu</button>
        </div>
      </Modal>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-slate-800 text-white z-50 transition-transform duration-300 w-64 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-4 border-b border-slate-700 flex items-center justify-between lg:justify-start">
          <h2 className="text-base font-bold">📚 MsMyenEnglish</h2>
          <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-slate-700 rounded lg:hidden">
            <X size={20} />
          </button>
        </div>
        <nav className="py-2 overflow-y-auto h-[calc(100%-60px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id}>
                {navItems.indexOf(item) === 0 || navItems[navItems.indexOf(item) - 1]?.section !== item.section ? (
                  <div className="px-4 pt-3 pb-1 text-[10px] uppercase text-slate-400 tracking-wider">{item.section}</div>
                ) : null}
                <button
                  onClick={() => { setCurrentPage(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${currentPage === item.id ? 'bg-amber-500 text-white font-semibold' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
                  <Icon size={18} />
                  {item.label}
                </button>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white border-b px-3 sm:px-4 lg:px-5 py-2.5 flex justify-between items-center sticky top-0 z-30 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg lg:hidden flex-shrink-0">
              <Menu size={20} />
            </button>
            <h1 className="text-base sm:text-xl font-bold truncate">{pageTitles[currentPage]}</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="px-1.5 py-1.5 sm:px-2 border-2 border-gray-200 rounded-lg text-xs bg-white w-[80px] sm:max-w-[120px] lg:max-w-[180px] sm:w-auto">
              <option value="">Tất cả</option>
              {classes.map(c => <option key={c.classId} value={c.name}>{c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name}</option>)}
            </select>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden md:block flex-shrink-0">
              <div className="text-sm font-semibold leading-tight">{user?.name}</div>
              <div className="text-xs text-gray-500">{user?.role}</div>
            </div>
            <button onClick={handleLogout} className="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1 flex-shrink-0">
              <LogOut size={14} className="sm:hidden" />
              <span className="hidden sm:inline">Thoát</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6">
          {renderPage()}
        </main>
      </div>

      {/* Modals */}
      {renderStudentModal()}
      {renderClassModal()}
      {renderScheduleModal()}
      {renderQuickAttModal()}
      {renderAttCellModal()}
      {renderEvaluationModal()}
      {renderBillModal()}
      {renderUserModal()}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="animate-spin w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full" />
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 px-5 py-3 rounded-xl text-white font-medium z-50 shadow-lg ${toast.type === 'error' ? 'bg-red-500' : toast.type === 'info' ? 'bg-blue-500' : 'bg-green-500'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
