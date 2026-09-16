import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BiometricAttendance } from '../components/BiometricAttendance';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Fingerprint,
  Search,
  CheckCheck,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  BookOpen,
  MapPin,
  Users
} from 'lucide-react';

export const Attendance: React.FC = () => {
  const {
    students,
    courses,
    timetable,
    attendanceRecords,
    saveAttendance,
    unlockAttendance,
    setActiveTab,
    currentUser
  } = useApp();

  // Pick today's date (or last weekday if today is weekend)
  const getInitialDate = () => {
    const d = new Date();
    const day = d.getDay();
    if (day === 0) d.setDate(d.getDate() - 2); // Friday if Sunday
    if (day === 6) d.setDate(d.getDate() - 1); // Friday if Saturday
    return d.toISOString().split('T')[0];
  };

  const userStream = currentUser?.role === 'rep' && currentUser?.stream ? currentUser.stream : null;

  const [selectedDate, setSelectedDate] = useState<string>(getInitialDate());
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [selectedStream, setSelectedStream] = useState<string>(userStream || 'all');
  const [viewMode, setViewMode] = useState<'manual' | 'biometric'>('manual');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sessionRecords, setSessionRecords] = useState<Record<string, 'present' | 'absent'>>({});
  const [biometricVerifiedIds, setBiometricVerifiedIds] = useState<string[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Synchronize stream if Class Rep logs in
  useEffect(() => {
    if (userStream) {
      setSelectedStream(userStream);
    }
  }, [userStream]);

  // Date parsing & Day of Week calculation
  const selectedDateObj = new Date(`${selectedDate}T00:00:00`);
  const dayOfWeek = selectedDateObj.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Find timetable sessions matching this weekday (and stream if specific)
  const scheduledSlotsForDay = timetable.filter((slot) => {
    if (slot.dayOfWeek !== dayOfWeek) return false;
    if (selectedStream === 'all') return true;
    return !slot.stream || slot.stream === 'all' || slot.stream === selectedStream;
  });

  // Auto-select course scheduled for that day if user hasn't picked yet, or default to first course
  useEffect(() => {
    if (courses.length === 0) {
      setSelectedCourseId('');
      return;
    }

    if (scheduledSlotsForDay.length > 0) {
      const match = scheduledSlotsForDay.find((s) => s.courseId === selectedCourseId);
      if (!match) {
        setSelectedCourseId(scheduledSlotsForDay[0].courseId);
      }
    } else if (!courses.some((c) => c.id === selectedCourseId)) {
      setSelectedCourseId(courses[0].id);
    }
  }, [selectedDate, timetable, courses, selectedCourseId, selectedStream]);

  // Filter students belonging to this stream / division
  const streamStudents = students.filter((s) => {
    if (selectedStream === 'all') return true;
    return s.stream === selectedStream;
  });

  // Load existing attendance record for this date + course + stream
  const existingRecord = attendanceRecords.find((r) => {
    if (r.date !== selectedDate || r.courseId !== selectedCourseId) return false;
    if (selectedStream === 'all') {
      return !r.stream || r.stream === 'all';
    }
    return r.stream === selectedStream;
  });

  const isFinalized = existingRecord?.isFinalized || false;

  useEffect(() => {
    if (existingRecord) {
      setSessionRecords(existingRecord.records || {});
      setBiometricVerifiedIds(existingRecord.biometricVerifiedStudentIds || []);
    } else {
      // Default: empty or all absent for stream students
      const initial: Record<string, 'present' | 'absent'> = {};
      streamStudents.forEach((s) => {
        initial[s.id] = 'absent';
      });
      setSessionRecords(initial);
      setBiometricVerifiedIds([]);
    }
  }, [selectedDate, selectedCourseId, selectedStream, existingRecord, streamStudents.length]);

  const activeCourse = courses.find((c) => c.id === selectedCourseId);
  const activeSlot = timetable.find(
    (t) => t.courseId === selectedCourseId && t.dayOfWeek === dayOfWeek
  );

  // Handlers
  const handleMarkStatus = (studentId: string, status: 'present' | 'absent') => {
    if (isFinalized) return;
    setSessionRecords((prev) => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAll = (status: 'present' | 'absent') => {
    if (isFinalized) return;
    const updated: Record<string, 'present' | 'absent'> = { ...sessionRecords };
    streamStudents.forEach((s) => {
      updated[s.id] = status;
    });
    setSessionRecords(updated);
  };

  const handleBiometricMarked = (studentId: string) => {
    setSessionRecords((prev) => ({
      ...prev,
      [studentId]: 'present'
    }));
    setBiometricVerifiedIds((prev) => Array.from(new Set([...prev, studentId])));
    // Auto-save draft
    saveAttendance(
      selectedDate,
      selectedCourseId,
      { ...sessionRecords, [studentId]: 'present' },
      Array.from(new Set([...biometricVerifiedIds, studentId])),
      false,
      selectedStream === 'all' ? undefined : selectedStream
    );
  };

  const handleSaveDraft = () => {
    saveAttendance(
      selectedDate,
      selectedCourseId,
      sessionRecords,
      biometricVerifiedIds,
      false,
      selectedStream === 'all' ? undefined : selectedStream
    );
    setSaveSuccessMsg('Attendance draft saved successfully.');
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  const handleFinalize = () => {
    const streamName = selectedStream === 'all' ? 'All Divisions' : `Division ${selectedStream}`;
    if (confirm(`Finalize and lock attendance session for ${streamName}? Once finalized, manual and biometric edits are protected.`)) {
      saveAttendance(
        selectedDate,
        selectedCourseId,
        sessionRecords,
        biometricVerifiedIds,
        true,
        selectedStream === 'all' ? undefined : selectedStream
      );
      setSaveSuccessMsg(`Attendance session for ${streamName} finalized and locked.`);
      setTimeout(() => setSaveSuccessMsg(''), 3500);
    }
  };

  const handleUnlock = () => {
    if (confirm('Unlock this session to allow modifications?')) {
      unlockAttendance(
        selectedDate,
        selectedCourseId,
        selectedStream === 'all' ? undefined : selectedStream
      );
      setSaveSuccessMsg('Session unlocked for edits.');
      setTimeout(() => setSaveSuccessMsg(''), 3500);
    }
  };

  // Filter students by search within the stream
  const filteredStudents = streamStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.indexNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const presentCount = streamStudents.filter((s) => sessionRecords[s.id] === 'present').length;
  const absentCount = streamStudents.filter((s) => sessionRecords[s.id] === 'absent' || !sessionRecords[s.id]).length;
  const attendanceRate = streamStudents.length > 0 ? Math.round((presentCount / streamStudents.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Page Title & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#007c82] dark:text-teal-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Class Attendance Session
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">Course Attendance Roster</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Record and finalize daily attendance for UENR degree courses. Weekends are automatically protected.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            onClick={() => setViewMode('manual')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'manual'
                ? 'bg-[#007c82] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Manual Checklist
          </button>
          <button
            onClick={() => setViewMode('biometric')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'biometric'
                ? 'bg-[#007c82] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            Biometric Scanner
          </button>
        </div>
      </div>

      {/* Notice if no courses exist yet */}
      {courses.length === 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 shadow-xs">
          <div>
            <strong className="block text-sm font-bold text-amber-950 dark:text-amber-100">No Courses Assigned Yet</strong>
            <span>You need to assign your course names and lecture days before taking class roll calls.</span>
          </div>
          <button
            onClick={() => setActiveTab('timetable')}
            className="px-4 py-2 rounded-xl bg-[#007c82] hover:bg-[#00666b] text-white font-bold transition-colors shadow-xs cursor-pointer shrink-0"
          >
            Go to Timetable to Assign Courses
          </button>
        </div>
      )}

      {/* Save / Status Toast Alert */}
      {saveSuccessMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl p-3.5 flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          {saveSuccessMsg}
        </div>
      )}

      {/* Date & Course Selection Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#007c82] dark:text-teal-400" />
              Attendance Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#007c82]"
            />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              {selectedDateObj.toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>

          {/* 2. Course Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#007c82] dark:text-teal-400" />
              Select Course
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              disabled={courses.length === 0}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#007c82] disabled:opacity-50"
            >
              {courses.length === 0 ? (
                <option value="">No courses assigned yet</option>
              ) : (
                courses.map((course) => {
                  const isScheduledToday = timetable.some(
                    (t) => t.courseId === course.id && t.dayOfWeek === dayOfWeek
                  );
                  return (
                    <option key={course.id} value={course.id}>
                      {course.code} – {course.title} {isScheduledToday ? '★ [Scheduled Today]' : ''}
                    </option>
                  );
                })
              )}
            </select>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block truncate">
              {activeCourse ? `Lecturer: ${activeCourse.lecturer}` : 'Please assign courses in Timetable.'}
            </span>
          </div>

          {/* 3. Class Division / Stream Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#007c82] dark:text-teal-400" />
              Class Division
            </label>
            {userStream ? (
              <div className="w-full bg-teal-50 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-800 rounded-xl px-3 py-2 text-sm text-[#007c82] dark:text-teal-300 font-bold flex items-center justify-between">
                <span>Division {userStream}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#007c82] text-white">
                  Class Rep Scoped
                </span>
              </div>
            ) : (
              <select
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#007c82]"
              >
                <option value="all">All Divisions (Full Cohort)</option>
                <option value="IT A">Division IT A</option>
                <option value="IT B">Division IT B</option>
                <option value="IT C">Division IT C</option>
                <option value="IT D">Division IT D</option>
                <option value="IT E">Division IT E</option>
              </select>
            )}
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              {streamStudents.length} student{streamStudents.length === 1 ? '' : 's'} in this division
            </span>
          </div>

          {/* 4. Session Status & Lock Badge */}
          <div className="flex flex-col justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Session Integrity
            </span>
            <div className="flex items-center justify-between mt-2">
              {isFinalized ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold">
                  <Lock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  Locked
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold">
                  <Unlock className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  Open
                </div>
              )}

              {isFinalized ? (
                <button
                  onClick={handleUnlock}
                  className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:text-teal-900 underline cursor-pointer"
                >
                  Unlock
                </button>
              ) : null}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {isFinalized ? 'Session locked' : 'Draft / Active'}
            </div>
          </div>
        </div>

        {/* Weekend Alert Message */}
        {isWeekend && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex items-center gap-3 text-amber-900 text-xs sm:text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <strong>⚠️ Weekend Selected:</strong> Regular university timetable lectures are held on weekdays (Monday to Friday). Attendance is disabled unless a special scheduled makeup session exists.
            </div>
          </div>
        )}

        {/* Timetable Session Notice */}
        {!isWeekend && activeSlot && (
          <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3 flex items-center justify-between text-xs text-teal-900">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#007c82]" />
              <span>
                <strong>Scheduled Timetable Slot:</strong> {activeSlot.startTime} – {activeSlot.endTime} · Venue: {activeSlot.venue}
              </span>
            </div>
            <span className="hidden sm:inline-block font-semibold text-[#007c82]">
              Verified Timetable Session
            </span>
          </div>
        )}
      </div>

      {/* BIOMETRIC MODE */}
      {viewMode === 'biometric' && activeCourse && (
        <BiometricAttendance
          date={selectedDate}
          course={activeCourse}
          presentStudentIds={Object.entries(sessionRecords)
            .filter(([, status]) => status === 'present')
            .map(([id]) => id)}
          isSessionFinalized={isFinalized}
          stream={selectedStream === 'all' ? undefined : selectedStream}
          onAttendanceMarked={handleBiometricMarked}
          onFinalizeSession={handleFinalize}
        />
      )}

      {/* MANUAL CHECKLIST MODE */}
      {viewMode === 'manual' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          
          {/* Header & Quick Action Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            
            {/* Live Count Pills */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {presentCount} Present
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800">
                <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                {absentCount} Absent
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Rate: <strong className="text-slate-800 dark:text-slate-200">{attendanceRate}%</strong> ({presentCount}/{streamStudents.length})
              </div>
            </div>

            {/* Quick Bulk Marking Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMarkAll('present')}
                disabled={isFinalized}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                Mark All Present
              </button>
              <button
                onClick={() => handleMarkAll('absent')}
                disabled={isFinalized}
                className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                Mark All Absent
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search student name or index number (e.g. UEB310...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#007c82]"
              />
            </div>
          </div>

          {/* Students Attendance Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Student Details</th>
                  <th className="py-3 px-4">Index Number</th>
                  <th className="py-3 px-4">Division</th>
                  <th className="py-3 px-4">Biometric Status</th>
                  <th className="py-3 px-4 text-center">Status Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                {streamStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                      <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No students in this class division</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Please assign students to {selectedStream === 'all' ? 'divisions' : `Division ${selectedStream}`} in the <strong>Student Roster & Staff</strong> tab.
                      </p>
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500">
                      No students found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, idx) => {
                    const status = sessionRecords[student.id] || 'absent';
                    const isPresent = status === 'present';
                    const isBiometricVerified = biometricVerifiedIds.includes(student.id);
                    const isEnrolled = student.enrolledFingers && student.enrolledFingers.length > 0;

                    return (
                      <tr
                        key={student.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                          isPresent ? 'bg-emerald-50/20 dark:bg-emerald-950/20' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-400 dark:text-slate-500">
                          {idx + 1}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{student.name}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{student.program}</div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {student.indexNumber}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-[#007c82] dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                            {student.stream || 'IT A'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {isBiometricVerified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-[11px] font-bold">
                              <Fingerprint className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                              Bio-Verified
                            </span>
                          ) : isEnrolled ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px]">
                              <Fingerprint className="w-3 h-3 text-slate-400" />
                              {student.enrolledFingers.length} finger(s)
                            </span>
                          ) : (
                            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                              Not Enrolled
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <button
                              onClick={() => handleMarkStatus(student.id, 'present')}
                              disabled={isFinalized}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                isPresent
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400'
                              } disabled:opacity-50`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => handleMarkStatus(student.id, 'absent')}
                              disabled={isFinalized}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                !isPresent
                                  ? 'bg-rose-600 text-white shadow-sm'
                                  : 'text-slate-600 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-400'
                              } disabled:opacity-50`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Save / Finalize Panel */}
          <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600 dark:text-slate-400 text-center sm:text-left">
              {isFinalized ? (
                <span className="text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Attendance for this date has already been saved and finalized.
                </span>
              ) : (
                <span>Mark all students before saving and finalizing the session.</span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!isFinalized && (
                <button
                  onClick={handleSaveDraft}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors shadow-sm cursor-pointer"
                >
                  Save Draft
                </button>
              )}

              <button
                onClick={handleFinalize}
                disabled={isFinalized}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer ${
                  isFinalized
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    : 'bg-[#003b5c] hover:bg-[#002d47] text-white'
                }`}
              >
                {isFinalized ? 'Session Locked' : 'Finalize & Lock Attendance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
