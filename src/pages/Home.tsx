import React from 'react';
import { useApp } from '../context/AppContext';
import { DashboardTop } from '../components/DashboardTop';
import {
  CalendarCheck,
  Users,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  Building2,
  Fingerprint
} from 'lucide-react';

export const Home: React.FC = () => {
  const { setActiveTab, students, attendanceRecords } = useApp();

  const totalStudents = students.length;
  const biometricCount = students.filter((s) => s.biometricEnrolled).length;
  const totalSessions = attendanceRecords.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Primary Executive Dashboard & Role Action Hero */}
      <DashboardTop />

      {/* Streamlined Workflows Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Quick Academic Workflows</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">BSc Information Technology</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Attendance & Biometrics */}
          <div
            onClick={() => setActiveTab('attendance')}
            className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                  {totalSessions} Recorded
                </span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Daily Roll Call & Biometrics
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Take fast attendance via checklist or optical fingerprint scanner with automatic weekend safeguards.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <span>Open Session</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Student Directory */}
          <div
            onClick={() => setActiveTab('admin')}
            className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/60 dark:hover:border-blue-500/60 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/40 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/60">
                  {totalStudents} Students
                </span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Class Roster & Enrollment
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Manage Level 300 student profiles, index numbers, and enroll 10-finger biometric records.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-400">
              <span className="flex items-center gap-1">
                <Fingerprint className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                {biometricCount} Enrolled
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: 75% Exam Eligibility */}
          <div
            onClick={() => setActiveTab('reports')}
            className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-500/60 dark:hover:border-teal-500/60 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#007c82] dark:text-teal-400 flex items-center justify-center border border-teal-100 dark:border-teal-900/40 group-hover:bg-[#007c82] group-hover:text-white transition-colors">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-[#007c82] dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800/60">
                  75% Rule
                </span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-[#007c82] dark:group-hover:text-teal-400 transition-colors">
                  Exam Eligibility & Reports
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Verify attendance percentages, identify students barred from exams, and export CSV/PDF reports.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-[#007c82] dark:text-teal-400">
              <span>View Compliance</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* Streamlined Campus Facility Reference Bar */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs relative group">
            <img
              src="/assets/uenr_campus.png"
              alt="UENR RCEES Complex"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                Main Campus Venue
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">Sunyani, Ghana</span>
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mt-0.5">
              Regional Centre for Energy & Environmental Sustainability (RCEES)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
              Smart amphitheaters and biometric laboratories hosting BSc IT lectures.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('timetable')}
          className="w-full md:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
        >
          <Building2 className="w-3.5 h-3.5 text-[#007c82] dark:text-teal-400" />
          <span>View Lecture Timetable</span>
          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </section>

      {/* Clean Institutional Footer */}
      <footer className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/50 flex items-center justify-center text-[#007c82] dark:text-teal-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
              University of Energy and Natural Resources (UENR)
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-[11px]">Department of Information Technology · Official Attendance System</p>
          </div>
        </div>

        <div className="text-center sm:text-right text-[11px] text-slate-400 dark:text-slate-500">
          <div>Accredited Academic Session · 2026/2027</div>
        </div>
      </footer>
    </div>
  );
};
