import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Course, TimetableSlot, Student } from '../types';
import {
  Sun,
  Moon,
  Sunrise,
  Clock,
  CalendarCheck,
  CalendarDays,
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  MapPin,
  User,
  Search,
  BookOpen,
  Database,
  RefreshCw,
  X,
  Fingerprint,
  ChevronRight,
  Layers,
  GraduationCap,
  Building2,
  Landmark,
  Image as ImageIcon
} from 'lucide-react';

const WEEKDAYS = [
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' }
];

export const DashboardTop: React.FC = () => {
  const {
    currentUser,
    students,
    courses,
    timetable,
    attendanceRecords,
    semester,
    firebaseUser,
    isCloudConnected,
    isSyncing,
    loginWithGoogle,
    setActiveTab,
    openDatabaseTab,
    setIsRoleMenuOpen
  } = useApp();

  // Live ticking clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Time of day greeting
  const hours = currentTime.getHours();
  const greeting =
    hours < 12 ? 'Good Morning' : hours < 17 ? 'Good Afternoon' : 'Good Evening';
  const GreetingIcon = hours < 12 ? Sunrise : hours < 18 ? Sun : Moon;

  const todayStr = currentTime.toISOString().split('T')[0];
  const dayOfWeek = currentTime.getDay(); // 0 = Sunday, 1 = Mon ... 6 = Sat
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Selected day for interactive schedule preview tab (default to current day, or Mon if Sun)
  const defaultPreviewDay = dayOfWeek === 0 ? 1 : dayOfWeek;
  const [previewDay, setPreviewDay] = useState<number>(defaultPreviewDay);

  // Scheduled slots for preview day & today
  const todaySlots = timetable.filter((slot) => slot.dayOfWeek === dayOfWeek);
  const previewDaySlots = timetable.filter((slot) => slot.dayOfWeek === previewDay);

  // Active primary course session today
  const activeCourseId = todaySlots.length > 0 ? todaySlots[0].courseId : courses[0]?.id;
  const activeCourse = courses.find((c) => c.id === activeCourseId);

  // Today's attendance calculation
  const todayRecord = attendanceRecords.find(
    (r) => r.date === todayStr && r.courseId === activeCourseId
  );

  let presentCount = 0;
  let absentCount = 0;
  let presentStudentIds: string[] = [];
  let absentStudentIds: string[] = [];

  if (todayRecord) {
    const entries = Object.entries(todayRecord.records);
    presentStudentIds = entries.filter(([_, s]) => s === 'present').map(([id]) => id);
    absentStudentIds = entries.filter(([_, s]) => s === 'absent').map(([id]) => id);
    presentCount = presentStudentIds.length;
    absentCount = absentStudentIds.length;
  }

  const enrolledCount = students.length;
  const biometricEnrolledCount = students.filter(
    (s) => s.enrolledFingers && s.enrolledFingers.length > 0
  ).length;
  const bioPercentage =
    enrolledCount > 0 ? Math.round((biometricEnrolledCount / enrolledCount) * 100) : 0;
  const attendanceRate =
    enrolledCount > 0 ? Math.round((presentCount / enrolledCount) * 100) : 0;

  // Interactive Modals State
  const [modalType, setModalType] = useState<
    'present' | 'absent' | 'search' | 'biometrics' | 'schedule' | 'campus' | null
  >(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtered students for Quick Lookup
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.indexNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine current class status (if today has slots)
  const getCurrentSlotStatus = (slot: TimetableSlot) => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const [startH, startM] = slot.startTime.split(':').map(Number);
    const [endH, endM] = slot.endTime.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    if (now >= startMins && now <= endMins) {
      return { status: 'in-progress', label: 'In Session Now', color: 'emerald' };
    } else if (now < startMins) {
      const diff = startMins - now;
      const hoursLeft = Math.floor(diff / 60);
      const minsLeft = diff % 60;
      const timeStr = hoursLeft > 0 ? `${hoursLeft}h ${minsLeft}m` : `${minsLeft}m`;
      return { status: 'upcoming', label: `Starts in ${timeStr}`, color: 'blue' };
    } else {
      return { status: 'completed', label: 'Class Ended', color: 'slate' };
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'hod':
        return { label: 'HOD', title: 'Head of Department', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'class_rep':
        return { label: 'Class Rep', title: 'Class Representative', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      default:
        return { label: 'Lecturer', title: 'Course Lecturer', color: 'bg-teal-100 text-teal-800 border-teal-200' };
    }
  };

  // Find currently active or next upcoming slot today
  const activeOrUpcomingSlot = todaySlots.length > 0
    ? (todaySlots.find((slot) => {
        const status = getCurrentSlotStatus(slot);
        return status.status === 'in-progress' || status.status === 'upcoming';
      }) || todaySlots[0])
    : undefined;

  const primarySlotCourse = activeOrUpcomingSlot ? courses.find((c) => c.id === activeOrUpcomingSlot.courseId) : undefined;
  const primarySlotStatus = activeOrUpcomingSlot ? getCurrentSlotStatus(activeOrUpcomingSlot) : null;

  const roleMeta = getRoleBadge(currentUser.role);

  return (
    <div className="space-y-6">
      
      {/* EXECUTIVE COMMAND DECK (Spacious, Airy, Non-Compacted) */}
      <div className="relative overflow-hidden rounded-3xl bg-[#002236] text-white shadow-2xl shadow-[#002236]/30 border border-white/15">
        
        {/* Blended Campus Landmark Photography (UENR RCEES Complex) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <img
            src="/assets/uenr_campus.png"
            alt="UENR Regional Centre for Energy and Environmental Sustainability"
            className="absolute right-0 top-0 w-full md:w-3/5 lg:w-[55%] h-full object-cover object-[center_35%] opacity-40 md:opacity-45 mix-blend-luminosity filter contrast-110 brightness-105 transition-all duration-700 hover:scale-105"
          />
          {/* Deep Teal & Navy Gradient Vignette for Razor-Sharp Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#001f33] via-[#002e48]/95 to-transparent sm:via-[#002e48]/85" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#001b2b]/95 via-transparent to-black/25" />
        </div>

        {/* Subtle Decorative Ambient Glows */}
        <div className="absolute top-0 right-1/4 -mt-16 w-80 h-80 rounded-full bg-[#8dc63f]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-20 w-96 h-96 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

        <div className="relative p-6 sm:p-8 lg:p-10 space-y-6">
          
          {/* Top Row: Greeting, Live Time, Semester, and Cloud Sync */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-white/15">
            
            {/* User Greeting & Department Info */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-emerald-300 backdrop-blur-md border border-white/20 shadow-sm">
                  <GreetingIcon className="w-3.5 h-3.5 text-amber-300" />
                  {greeting}
                </span>

                <button
                  type="button"
                  onClick={() => setIsRoleMenuOpen(true)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border backdrop-blur-md cursor-pointer hover:opacity-90 active:scale-95 transition-all shadow-xs ${roleMeta.color}`}
                  title="Click to switch active role or account options"
                  aria-label="Click to switch active role or account options"
                >
                  <span>{roleMeta.label}</span>
                  <span className="text-[10px] opacity-75 underline underline-offset-1">Switch ▾</span>
                </button>

                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-200/90 font-medium">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
                  UENR IT Dept
                </span>

                {/* Campus Landmark Badge / Preview trigger */}
                <button
                  type="button"
                  onClick={() => setModalType('campus')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-400/30 backdrop-blur-md transition-all cursor-pointer shadow-sm group"
                  title="Click to view campus facility details"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-300 group-hover:scale-110 transition-transform" />
                  <span>RCEES Complex</span>
                  <span className="text-[10px] text-emerald-400 underline underline-offset-2">View Building</span>
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white drop-shadow-sm">
                Course Attendance & Faculty Portal
              </h1>

              <p className="text-xs sm:text-sm text-slate-200/90 max-w-xl font-normal leading-relaxed">
                Daily course roll calls, biometric fingerprint verification, and 75% exam compliance.
              </p>
            </div>

            {/* Right Interactive Status Hub: Live Clock & Cloud Sync Badge */}
            <div className="flex items-center gap-3 flex-wrap lg:flex-col lg:items-end">
              {/* Live Digital Clock & Calendar */}
              <div className="flex items-center gap-2.5 bg-black/35 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 shadow-inner">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-base font-black text-white font-mono tracking-wider">
                    {currentTime.toLocaleTimeString('en-GB', { hour12: false })}
                  </div>
                  <div className="text-[10px] text-slate-300 font-medium">
                    {currentTime.toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </div>
                </div>
              </div>

              {/* Cloud Sync Status Pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/35 text-slate-200 border border-white/15 text-xs font-medium backdrop-blur-md shadow-inner">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span>{isCloudConnected ? 'Firestore Active' : 'Offline / Local State'}</span>
              </div>
            </div>
          </div>

          {/* Role-Focused Primary Action Hero Card */}
          <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#8dc63f]/25 text-[#8dc63f] border border-[#8dc63f]/40">
                    {currentUser.role === 'hod'
                      ? 'HOD Priority'
                      : currentUser.role === 'class_rep'
                      ? 'Class Rep Assistance'
                      : 'Primary Lecturer Action'}
                  </span>
                  {activeOrUpcomingSlot && (
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        primarySlotStatus?.status === 'in-progress'
                          ? 'bg-emerald-400 text-[#003b5c] animate-pulse'
                          : 'bg-blue-400/30 text-blue-200'
                      }`}
                    >
                      {primarySlotStatus?.label}
                    </span>
                  )}
                </div>

                {currentUser.role === 'hod' ? (
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white">
                      Departmental Attendance & Compliance Oversight
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-200">
                      Audit Level 300 attendance rates, verify 75% exam compliance, and manage staff access.
                    </p>
                  </div>
                ) : activeOrUpcomingSlot && primarySlotCourse ? (
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white">
                      {primarySlotCourse.code} · {primarySlotCourse.title}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-slate-200 mt-1 flex-wrap font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-300" />
                        {activeOrUpcomingSlot.startTime} – {activeOrUpcomingSlot.endTime}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-300" />
                        {activeOrUpcomingSlot.venue}
                      </span>
                      {primarySlotCourse.lecturer && primarySlotCourse.lecturer !== 'Unassigned' && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-300 font-semibold">
                            {primarySlotCourse.lecturer}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white">
                      {isWeekend ? 'Weekend: No Timetable Lectures Today' : 'No Timetable Lectures Scheduled Today'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-200">
                      Lectures and assigned lecturers will only appear when you explicitly create and assign them in Timetable.
                    </p>
                  </div>
                )}
              </div>

              {/* Primary & Secondary Call to Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {currentUser.role === 'hod' ? (
                  <>
                    <button
                      onClick={() => setActiveTab('reports')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8dc63f] to-[#7bb033] hover:from-[#96d244] hover:to-[#85bd37] text-[#003b5c] font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Audit 75% Compliance</span>
                      <ArrowRight className="w-4 h-4 ml-0.5" />
                    </button>
                    <button
                      onClick={() => setActiveTab('admin')}
                      className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-bold backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                    >
                      <Users className="w-4 h-4" />
                      <span>Staff & Students</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setActiveTab('attendance')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8dc63f] to-[#7bb033] hover:from-[#96d244] hover:to-[#85bd37] text-[#003b5c] font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer ring-2 ring-emerald-400/50"
                    >
                      <CalendarCheck className="w-4 h-4" />
                      <span>{currentUser.role === 'class_rep' ? 'Assist Roll Call' : 'Start Attendance Session'}</span>
                      <ArrowRight className="w-4 h-4 ml-0.5" />
                    </button>

                    <button
                      onClick={() => setModalType('search')}
                      className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-semibold backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                      title="Quick Student Search"
                    >
                      <Search className="w-4 h-4 text-emerald-300" />
                      <span className="hidden sm:inline">Search Student</span>
                    </button>

                    <button
                      onClick={() => setModalType('schedule')}
                      className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-semibold backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                      title="Week Timetable"
                    >
                      <CalendarDays className="w-4 h-4 text-amber-300" />
                      <span className="hidden sm:inline">Timetable</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Live Academic Ribbon: Today's Class Timeline / Day Switcher */}
          <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8dc63f] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8dc63f]"></span>
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {isWeekend ? 'Weekend Notice' : "Today's Scheduled Sessions"}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/15 text-slate-200 font-medium">
                  {todaySlots.length} {todaySlots.length === 1 ? 'class' : 'classes'} on timetable
                </span>
              </div>

              {/* Quick Weekday Pill Switcher */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
                {WEEKDAYS.map((day) => {
                  const isToday = day.id === dayOfWeek;
                  const isSelected = day.id === previewDay;
                  const countForDay = timetable.filter((t) => t.dayOfWeek === day.id).length;

                  return (
                    <button
                      key={day.id}
                      onClick={() => setPreviewDay(day.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                        isSelected
                          ? 'bg-[#8dc63f] text-[#003b5c] shadow-xs'
                          : 'bg-white/10 text-slate-200 hover:bg-white/20'
                      }`}
                    >
                      <span>{day.short}</span>
                      {countForDay > 0 && (
                        <span
                          className={`text-[10px] px-1 rounded-full ${
                            isSelected ? 'bg-[#003b5c]/20 text-[#003b5c]' : 'bg-white/20 text-white'
                          }`}
                        >
                          {countForDay}
                        </span>
                      )}
                      {isToday && <span className="w-1 h-1 rounded-full bg-emerald-400"></span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content for Selected Day */}
            {previewDaySlots.length === 0 ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/5 rounded-xl p-3 border border-white/10 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>
                    No classes scheduled for{' '}
                    <strong>{WEEKDAYS.find((d) => d.id === previewDay)?.name}</strong>.
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('timetable')}
                  className="text-emerald-300 hover:text-white font-bold underline text-xs cursor-pointer"
                >
                  + Assign Courses in Timetable
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {previewDaySlots.map((slot) => {
                  const course = courses.find((c) => c.id === slot.courseId);
                  const statusMeta = getCurrentSlotStatus(slot);

                  return (
                    <div
                      key={slot.id}
                      onClick={() => setActiveTab('attendance')}
                      className="group bg-white/10 hover:bg-white/15 transition-all p-3 rounded-xl border border-white/15 cursor-pointer flex flex-col justify-between space-y-2 hover:border-[#8dc63f]/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-black text-white bg-white/20 px-2 py-0.5 rounded-md">
                          {course?.code || 'COURSE'}
                        </span>
                        {previewDay === dayOfWeek && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              statusMeta.status === 'in-progress'
                                ? 'bg-emerald-400 text-[#003b5c] animate-pulse'
                                : statusMeta.status === 'upcoming'
                                ? 'bg-blue-400/30 text-blue-200'
                                : 'bg-white/10 text-slate-300'
                            }`}
                          >
                            {statusMeta.label}
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-bold text-white line-clamp-1 group-hover:text-emerald-300 transition-colors">
                        {course?.title || 'Lecture Session'}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-white/10">
                        <span className="flex items-center gap-1 font-mono text-emerald-200">
                          <Clock className="w-3 h-3" />
                          {slot.startTime} – {slot.endTime}
                        </span>
                        <span className="flex items-center gap-1 text-slate-300 truncate max-w-[120px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{slot.venue}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* INTERACTIVE METRIC CARDS (Clickable for instant insights) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Present Today Card */}
        <div
          onClick={() => setModalType('present')}
          className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Present Today
              </span>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1.5">
                {presentCount}
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  ({attendanceRate}% rate)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Click to view present list
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Micro Attendance Rate Progress Bar */}
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(attendanceRate, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Absent Today Card */}
        <div
          onClick={() => setModalType('absent')}
          className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-rose-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Absent Today
              </span>
              <div className="text-3xl font-black text-rose-600 dark:text-rose-400">{absentCount}</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                Click to review missing
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/40 group-hover:scale-105 transition-transform">
              <XCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${enrolledCount > 0 ? Math.min((absentCount / enrolledCount) * 100, 100) : 0}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Enrolled Students Card */}
        <div
          onClick={() => setModalType('search')}
          className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#003b5c] dark:hover:border-sky-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Enrolled Students
              </span>
              <div className="text-3xl font-black text-[#003b5c] dark:text-sky-300">{enrolledCount}</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#003b5c] dark:text-sky-400" />
                Click to search directory
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[#003b5c] dark:text-sky-300 flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>BSc Information Tech</span>
            <span className="font-bold text-[#007c82] dark:text-teal-400">Level 300</span>
          </div>
        </div>

        {/* Biometrics Ready Card */}
        <div
          onClick={() => setModalType('biometrics')}
          className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Biometric Security
              </span>
              <div className="text-3xl font-black text-[#007c82] dark:text-teal-400 flex items-baseline gap-1.5">
                {biometricEnrolledCount}
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  / {enrolledCount} ({bioPercentage}%)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Fingerprint className="w-3.5 h-3.5 text-[#007c82] dark:text-teal-400" />
                Click for biometric stats
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-[#007c82] dark:text-teal-400 flex items-center justify-center border border-teal-100 dark:border-teal-900/40 group-hover:scale-105 transition-transform">
              <Fingerprint className="w-6 h-6" />
            </div>
          </div>

          {/* Biometric Coverage Bar */}
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#007c82] dark:bg-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${bioPercentage}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* QUICK STUDENT SEARCH MODAL */}
      {modalType === 'search' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black text-[#007c82] uppercase tracking-wider">
                  Fast Directory Lookup
                </span>
                <h3 className="text-lg font-black text-slate-900">Student Quick Search</h3>
                <p className="text-xs text-slate-500">
                  Find student contact information, index number, and biometric enrollment status.
                </p>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by student name or index number (e.g. UEB3100122)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#007c82]"
              />
            </div>

            {/* Students List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 space-y-1 pr-1">
              {filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No students found matching "{searchQuery}"
                </div>
              ) : (
                filteredStudents.map((s) => {
                  const hasBio = s.enrolledFingers && s.enrolledFingers.length > 0;
                  return (
                    <div
                      key={s.id}
                      className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#007c82] flex items-center justify-center font-bold text-xs shrink-0">
                          {s.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900 truncate">{s.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span className="font-mono text-teal-800 font-semibold">{s.indexNumber}</span>
                            <span>·</span>
                            <span>{s.level}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {hasBio ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            <Fingerprint className="w-3 h-3" />
                            Biometric Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                            No Fingerprints
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Total: {filteredStudents.length} of {students.length} students
              </span>
              <button
                onClick={() => {
                  setModalType(null);
                  setActiveTab('admin');
                }}
                className="text-xs font-bold text-[#007c82] hover:underline cursor-pointer"
              >
                Go to Full Student Roster →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRESENT STUDENTS MODAL */}
      {modalType === 'present' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                  Session Attendance Status
                </span>
                <h3 className="text-lg font-black text-slate-900">Present Students Today</h3>
                <p className="text-xs text-slate-500">
                  {presentCount} student{presentCount === 1 ? '' : 's'} recorded present for {activeCourse?.code || 'today'}.
                </p>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-1">
              {presentStudentIds.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No attendance has been saved yet for today's session.
                </div>
              ) : (
                presentStudentIds.map((sid) => {
                  const student = students.find((s) => s.id === sid);
                  const isBiometric = todayRecord?.biometricVerifiedStudentIds?.includes(sid);
                  return (
                    <div key={sid} className="py-2 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {student?.name || 'Student'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {student?.indexNumber}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          isBiometric
                            ? 'bg-teal-50 text-teal-800 border border-teal-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {isBiometric ? <Fingerprint className="w-3 h-3 text-[#007c82]" /> : null}
                        {isBiometric ? 'Biometric Verified' : 'Marked Present'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => {
                  setModalType(null);
                  setActiveTab('attendance');
                }}
                className="px-4 py-2 bg-[#007c82] hover:bg-[#00666b] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Open Roll Call Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABSENT STUDENTS MODAL */}
      {modalType === 'absent' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider">
                  Session Attendance Status
                </span>
                <h3 className="text-lg font-black text-slate-900">Absent Students Today</h3>
                <p className="text-xs text-slate-500">
                  {absentCount} student{absentCount === 1 ? '' : 's'} recorded absent for {activeCourse?.code || 'today'}.
                </p>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-1">
              {absentStudentIds.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No students recorded absent for today.
                </div>
              ) : (
                absentStudentIds.map((sid) => {
                  const student = students.find((s) => s.id === sid);
                  return (
                    <div key={sid} className="py-2 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {student?.name || 'Student'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {student?.indexNumber}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
                        Absent
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => {
                  setModalType(null);
                  setActiveTab('attendance');
                }}
                className="px-4 py-2 bg-[#007c82] hover:bg-[#00666b] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Open Roll Call Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BIOMETRIC SUMMARY MODAL */}
      {modalType === 'biometrics' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black text-[#007c82] uppercase tracking-wider">
                  Optical Security
                </span>
                <h3 className="text-lg font-black text-slate-900">Biometric Enrollment Status</h3>
                <p className="text-xs text-slate-500">
                  {biometricEnrolledCount} of {enrolledCount} students have enrolled fingerprints ({bioPercentage}%).
                </p>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Class Enrollment Coverage</span>
                <span className="text-[#007c82] font-black">{bioPercentage}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#007c82] h-full rounded-full transition-all duration-500"
                  style={{ width: `${bioPercentage}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Students without registered fingerprints will be flagged in manual roll call mode. You can register fingers via the Student Roster.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setModalType(null);
                  setActiveTab('admin');
                }}
                className="px-4 py-2 bg-[#007c82] hover:bg-[#00666b] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Fingerprint className="w-4 h-4" />
                <span>Go to Biometric Enrollment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WEEK TIMETABLE MODAL */}
      {modalType === 'schedule' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black text-[#007c82] uppercase tracking-wider">
                  Academic Schedule
                </span>
                <h3 className="text-lg font-black text-slate-900">Weekly Timetable Overview</h3>
                <p className="text-xs text-slate-500">
                  {timetable.length} scheduled session{timetable.length === 1 ? '' : 's'} across {courses.length} course{courses.length === 1 ? '' : 's'}.
                </p>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Day Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {WEEKDAYS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setPreviewDay(d.id)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    previewDay === d.id
                      ? 'bg-white text-[#007c82] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d.short}
                </button>
              ))}
            </div>

            {/* Day Slots List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {previewDaySlots.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                  No classes scheduled for {WEEKDAYS.find((d) => d.id === previewDay)?.name}
                </div>
              ) : (
                previewDaySlots.map((slot) => {
                  const course = courses.find((c) => c.id === slot.courseId);
                  return (
                    <div
                      key={slot.id}
                      className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-[#007c82] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                            {course?.code}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{course?.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{course?.lecturer && course.lecturer !== 'Unassigned' ? course.lecturer : 'Lecturer Unassigned'}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {slot.venue}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-slate-800 font-mono">
                          {slot.startTime} – {slot.endTime}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setModalType(null);
                  setActiveTab('timetable');
                }}
                className="text-xs font-bold text-[#007c82] hover:underline cursor-pointer"
              >
                Go to Full Timetable Manager →
              </button>
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modal 6: Campus Architectural Landmark Showcase */}
      {modalType === 'campus' && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Image Header */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900">
              <img
                src="/assets/uenr_campus.png"
                alt="UENR Regional Centre for Energy and Environmental Sustainability"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 backdrop-blur-md transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#8dc63f] text-[#003b5c]">
                  <Landmark className="w-3.5 h-3.5" />
                  UENR Center of Excellence
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  Regional Centre for Energy & Environmental Sustainability (RCEES)
                </h3>
                <p className="text-xs sm:text-sm text-slate-200">
                  University of Energy and Natural Resources · Main Campus, Sunyani, Ghana
                </p>
              </div>
            </div>

            {/* Modal Body: Information & Department Facilities */}
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Campus Location</div>
                  <div className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#007c82]" />
                    Sunyani, Bono Region
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Academic Affiliation</div>
                  <div className="text-sm font-black text-[#007c82] flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#8dc63f]" />
                    IT & Engineering Faculty
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">System Integration</div>
                  <div className="text-sm font-black text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Biometrics Active
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <p>
                  The RCEES complex is an ultra-modern institutional facility at UENR, serving as a hub for postgraduate research, ICT lectures, multidisciplinary engineering seminars, and university faculty operations.
                </p>
                <p>
                  Lectures registered in this Course Attendance System operate in the state-of-the-art amphitheaters, smart laboratories, and conference facilities situated across this architectural landmark.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setModalType(null);
                    setActiveTab('attendance');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#007c82] text-white text-xs font-bold hover:bg-[#00666b] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Mark Attendance In Venue</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
