import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Users,
  CalendarCheck,
  Percent,
  BookOpen,
  Filter,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

export const Reports: React.FC = () => {
  const { students, courses, attendanceRecords, semester, currentUser } = useApp();

  const userStream = currentUser?.role === 'rep' && currentUser?.stream ? currentUser.stream : null;

  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [selectedStreamFilter, setSelectedStreamFilter] = useState<string>(userStream || 'all');

  useEffect(() => {
    if (userStream) {
      setSelectedStreamFilter(userStream);
    }
  }, [userStream]);

  // Filter attendance records by course and stream
  const relevantRecords = attendanceRecords.filter((record) => {
    if (selectedCourseFilter !== 'all' && record.courseId !== selectedCourseFilter) return false;
    if (selectedStreamFilter !== 'all') {
      return !record.stream || record.stream === 'all' || record.stream === selectedStreamFilter;
    }
    return true;
  });

  // Filter students by selected stream
  const filteredStudents = students.filter((student) => {
    if (selectedStreamFilter === 'all') return true;
    return student.stream === selectedStreamFilter;
  });

  // Calculate high level totals scoped to selected students
  let totalPresentMarks = 0;
  let totalAbsentMarks = 0;

  relevantRecords.forEach((rec) => {
    filteredStudents.forEach((st) => {
      const status = rec.records[st.id];
      if (status === 'present') totalPresentMarks++;
      else if (status === 'absent') totalAbsentMarks++;
    });
  });

  const totalPossibleMarks = totalPresentMarks + totalAbsentMarks;
  const overallRate = totalPossibleMarks > 0 ? Math.round((totalPresentMarks / totalPossibleMarks) * 100) : 0;

  // Calculate per-student attendance without interference from other streams' sessions
  const studentStats = filteredStudents.map((student) => {
    let attended = 0;
    // Relevant sessions for THIS student's stream
    const studentSessions = relevantRecords.filter(
      (rec) => !rec.stream || rec.stream === 'all' || rec.stream === (student.stream || 'IT A')
    );
    const totalSessions = studentSessions.length;

    studentSessions.forEach((record) => {
      if (record.records[student.id] === 'present') {
        attended++;
      }
    });

    const rate = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 100;
    const isEligibleForExam = rate >= 75;

    return {
      student,
      attended,
      totalSessions,
      rate,
      isEligibleForExam
    };
  });

  const atRiskCount = studentStats.filter((s) => !s.isEligibleForExam).length;
  const eligibleCount = studentStats.filter((s) => s.isEligibleForExam).length;

  // Export CSV function
  const handleExportCSV = () => {
    const headers = ['Name', 'Index Number', 'Division', 'Program', 'Attended', 'Total Sessions', 'Attendance Rate (%)', 'Exam Eligibility'];
    const rows = studentStats.map((s) => [
      `"${s.student.name}"`,
      `"${s.student.indexNumber}"`,
      `"${s.student.stream || 'IT A'}"`,
      `"${s.student.program}"`,
      s.attended,
      s.totalSessions,
      `${s.rate}%`,
      s.isEligibleForExam ? 'Eligible' : 'At Risk (<75%)'
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `UENR_Attendance_Report_${selectedCourseFilter}_${selectedStreamFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 print:m-0 print:p-0">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#007c82] dark:text-teal-400 uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            Analytics & Academic Standing
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">Attendance Reports & Exam Clearance</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {semester.name} · Enforces the UENR 75% minimum course attendance rule for end-of-semester examinations.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-[#003b5c] hover:bg-[#002d47] text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* Filter Selector Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
          
          {/* Course Filter */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <BookOpen className="w-4 h-4 text-[#007c82] dark:text-teal-400" />
            <span>Course:</span>
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#007c82]"
            >
              <option value="all">All Registered Courses ({courses.length})</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} – {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Stream Filter */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Users className="w-4 h-4 text-[#007c82] dark:text-teal-400" />
            <span>Division:</span>
            {userStream ? (
              <span className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#007c82] dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold">
                Division {userStream}
              </span>
            ) : (
              <select
                value={selectedStreamFilter}
                onChange={(e) => setSelectedStreamFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#007c82]"
              >
                <option value="all">All Divisions (Full Cohort)</option>
                <option value="IT A">Division IT A</option>
                <option value="IT B">Division IT B</option>
                <option value="IT C">Division IT C</option>
                <option value="IT D">Division IT D</option>
                <option value="IT E">Division IT E</option>
              </select>
            )}
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Showing <strong>{filteredStudents.length}</strong> student{filteredStudents.length === 1 ? '' : 's'} across <strong>{relevantRecords.length}</strong> session{relevantRecords.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Sessions */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Sessions Held</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">{relevantRecords.length}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Recorded class sessions</p>
        </div>

        {/* Overall Attendance */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Overall Attendance</span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{overallRate}%</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{totalPresentMarks} present / {totalAbsentMarks} absent</p>
        </div>

        {/* Exam Eligible */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Exam Eligible (≥75%)</span>
          <div className="text-3xl font-black text-teal-700 dark:text-teal-400 mt-1">{eligibleCount}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Students cleared for finals</p>
        </div>

        {/* At Risk */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">At Risk of Debarment</span>
          <div className={`text-3xl font-black mt-1 ${atRiskCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-600'}`}>
            {atRiskCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Below the 75% cutoff threshold</p>
        </div>
      </div>

      {/* Visual Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 print:hidden">
        
        {/* Donut Chart: Present vs Absent */}
        <div className="md:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-4">Roll Call Distribution</h3>
          
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* SVG Donut */}
            <svg viewBox="0 0 36 36" className="w-40 h-40 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="18"
                cy="18"
                r="15.91549430918954"
                fill="transparent"
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-700"
                strokeWidth="4"
              />
              {/* Present arc */}
              <circle
                cx="18"
                cy="18"
                r="15.91549430918954"
                fill="transparent"
                stroke="#007c82"
                strokeWidth="4"
                strokeDasharray={`${overallRate} ${100 - overallRate}`}
                strokeDashoffset="0"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{overallRate}%</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Attendance</span>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#007c82]" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Present ({totalPresentMarks})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Absent ({totalAbsentMarks})</span>
            </div>
          </div>
        </div>

        {/* 75% Exam Policy Notice Card */}
        <div className="md:col-span-7 bg-gradient-to-br from-teal-900 to-[#003b5c] text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              <ShieldCheck className="w-4 h-4" />
              UENR Academic Board Policy · Regulation 14.2
            </div>
            <h3 className="text-xl font-bold">Mandatory 75% Class Attendance Requirement</h3>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              In accordance with the Academic Regulations of the University of Energy and Natural Resources, students are required to attain at least <strong>75% attendance</strong> in lectures and practical sessions in each registered course to be eligible to sit for the end-of-semester examination.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300">
            <span>Barred students must submit approved medical/official excuses to Academic Affairs.</span>
            <span className="font-semibold text-emerald-300">BSc IT Department Desk</span>
          </div>
        </div>
      </div>

      {/* Student Attendance Matrix & Exam Eligibility Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Student Attendance Breakdown & Exam Status</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Individual attendance percentages and exam qualification status.
            </p>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Passing threshold: <strong className="text-emerald-700 dark:text-emerald-400">75%</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Index Number</th>
                <th className="py-3.5 px-4">Division</th>
                <th className="py-3.5 px-4">Sessions Attended</th>
                <th className="py-3.5 px-4">Attendance Rate</th>
                <th className="py-3.5 px-4 text-center">Exam Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
              {studentStats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No Student Records Found</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      No students found in this division or matching the selected filters.
                    </p>
                  </td>
                </tr>
              ) : (
                studentStats.map((item, idx) => (
                <tr key={item.student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-400 dark:text-slate-500">{idx + 1}</td>

                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {item.student.name}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {item.student.indexNumber}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-[#007c82] dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      {item.student.stream || 'IT A'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-white">{item.attended}</span> / {item.totalSessions} sessions
                  </td>

                  <td className="py-3.5 px-4 w-48">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className={item.rate >= 75 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {item.rate}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.rate >= 75 ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${item.rate}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {item.isEligibleForExam ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Eligible
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        At Risk (&lt;75%)
                      </span>
                    )}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session History Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden print:hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/80">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Recorded Class Sessions History</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chronological audit of saved and finalized roll calls.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Course</th>
                <th className="py-3.5 px-4">Division</th>
                <th className="py-3.5 px-4">Present</th>
                <th className="py-3.5 px-4">Absent</th>
                <th className="py-3.5 px-4">Turnout</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
              {relevantRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    No attendance sessions recorded yet matching current filters.
                  </td>
                </tr>
              ) : (
                relevantRecords.map((record) => {
                  const course = courses.find((c) => c.id === record.courseId);
                  const p = Object.values(record.records).filter((s) => s === 'present').length;
                  const a = Object.values(record.records).filter((s) => s === 'absent').length;
                  const total = p + a;
                  const rate = total > 0 ? Math.round((p / total) * 100) : 0;

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {new Date(`${record.date}T00:00:00`).toLocaleDateString('en-GB', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {course?.code} – {course?.title}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs font-bold">
                        <span className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-[#007c82] dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          {record.stream || 'All Streams'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-emerald-700 dark:text-emerald-400 font-bold">{p}</td>
                      <td className="py-3.5 px-4 text-rose-600 dark:text-rose-400 font-bold">{a}</td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-white">{rate}%</span>
                      </td>

                      <td className="py-3.5 px-4">
                        {record.isFinalized ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                            Finalized
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                            Draft
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

