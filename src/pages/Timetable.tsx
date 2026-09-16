import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Course, TimetableSlot } from '../types';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  Trash2,
  BookOpen,
  Calendar,
  Layers,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Edit2,
  User,
  AlertCircle,
  X,
  RefreshCw,
  Check,
  Wifi,
  WifiOff,
  Smartphone,
  HardDriveDownload,
  Printer
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' }
];

const VENUE_PRESETS = [
  'LT 1 - Main Campus',
  'LT 2 - Sunyani Campus',
  'LT 3 - Lecture Hall',
  'Computer Complex Lab 1',
  'Computer Complex Lab 2',
  'Main Auditorium',
  'Block B - Room 14'
];

const TIME_PRESETS = [
  { label: '08:00 – 10:00', start: '08:00', end: '10:00' },
  { label: '10:30 – 12:30', start: '10:30', end: '12:30' },
  { label: '13:00 – 15:00', start: '13:00', end: '15:00' },
  { label: '15:30 – 17:30', start: '15:30', end: '17:30' },
  { label: '18:00 – 20:00', start: '18:00', end: '20:00' }
];

export const Timetable: React.FC = () => {
  const {
    courses,
    timetable,
    semester,
    isOnline,
    isPoorConnection,
    offlineCacheInfo,
    saveTimetableOffline,
    addCourse,
    updateCourse,
    removeCourse,
    clearAllCourses,
    addTimetableSlot,
    updateTimetableSlot,
    removeTimetableSlot,
    clearAllTimetableSlots,
    assignCourseWithSchedule
  } = useApp();

  const [activeTab, setActiveTab] = useState<'schedule' | 'courses'>('schedule');
  const [includeSaturday, setIncludeSaturday] = useState<boolean>(false);
  const [showPocketView, setShowPocketView] = useState<boolean>(false);
  const [offlineSaveNotice, setOfflineSaveNotice] = useState<string | null>(null);
  const [selectedTimetableStream, setSelectedTimetableStream] = useState<string>('all');

  const handleManualSaveOffline = () => {
    const success = saveTimetableOffline();
    if (success) {
      setOfflineSaveNotice('Timetable snapshot saved to device for offline access!');
      setTimeout(() => setOfflineSaveNotice(null), 4000);
    }
  };

  // Unified "Assign Course & Study Days" Modal
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [assignMode, setAssignMode] = useState<'new' | 'existing'>('new');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [courseCode, setCourseCode] = useState<string>('');
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [creditHours, setCreditHours] = useState<number>(3);
  const [lecturer, setLecturer] = useState<string>('');
  const [department, setDepartment] = useState<string>('Department of Information Technology');
  const [slotStream, setSlotStream] = useState<string>('all');
  
  // Selected Days for study (e.g. [1] for Mon, or [2, 4] for Tue & Thu)
  const [selectedDays, setSelectedDays] = useState<number[]>([1]);
  const [startTime, setStartTime] = useState<string>('08:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [venue, setVenue] = useState<string>('LT 2 - Sunyani Campus');

  // Edit Slot Modal
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [editSlotCourseId, setEditSlotCourseId] = useState<string>('');
  const [editSlotDay, setEditSlotDay] = useState<number>(1);
  const [editSlotStart, setEditSlotStart] = useState<string>('08:00');
  const [editSlotEnd, setEditSlotEnd] = useState<string>('10:00');
  const [editSlotVenue, setEditSlotVenue] = useState<string>('');
  const [editSlotStream, setEditSlotStream] = useState<string>('all');

  // Edit Course Modal
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editCourseCode, setEditCourseCode] = useState<string>('');
  const [editCourseTitle, setEditCourseTitle] = useState<string>('');
  const [editCourseCredits, setEditCourseCredits] = useState<number>(3);
  const [editCourseLecturer, setEditCourseLecturer] = useState<string>('');

  // Confirmation Modals
  const [showClearConfirm, setShowClearConfirm] = useState<'schedule' | 'courses' | null>(null);

  // Open Assign Modal with pre-selected day
  const openAssignModalForDay = (dayId: number) => {
    setSelectedDays([dayId]);
    if (courses.length > 0) {
      setAssignMode('existing');
      setSelectedCourseId(courses[0].id);
    } else {
      setAssignMode('new');
    }
    setShowAssignModal(true);
  };

  // Open Assign Modal for specific existing course
  const openAssignModalForCourse = (course: Course) => {
    setAssignMode('existing');
    setSelectedCourseId(course.id);
    setSelectedDays([1]);
    setShowAssignModal(true);
  };

  const toggleDaySelection = (dayId: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? (prev.length > 1 ? prev.filter((d) => d !== dayId) : prev) : [...prev, dayId]
    );
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetStream = slotStream === 'all' ? undefined : slotStream;

    if (assignMode === 'new') {
      if (!courseCode.trim() || !courseTitle.trim()) return;

      const codeClean = courseCode.toUpperCase().trim();
      const titleClean = courseTitle.trim();
      const lecturerClean = lecturer.trim() || 'Department Lecturer';

      for (const day of selectedDays) {
        await assignCourseWithSchedule(
          {
            code: codeClean,
            title: titleClean,
            creditHours: Number(creditHours),
            lecturer: lecturerClean,
            department
          },
          {
            dayOfWeek: day,
            startTime,
            endTime,
            venue: venue.trim() || 'LT 1',
            stream: targetStream
          }
        );
      }
    } else {
      if (!selectedCourseId) return;

      for (const day of selectedDays) {
        await addTimetableSlot({
          courseId: selectedCourseId,
          dayOfWeek: day,
          startTime,
          endTime,
          venue: venue.trim() || 'LT 1',
          stream: targetStream
        });
      }
    }

    // Reset Form
    setCourseCode('');
    setCourseTitle('');
    setLecturer('');
    setSelectedDays([1]);
    setSlotStream('all');
    setShowAssignModal(false);
  };

  // Handle Edit Slot Submit
  const handleEditSlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    await updateTimetableSlot(editingSlot.id, {
      courseId: editSlotCourseId,
      dayOfWeek: editSlotDay,
      startTime: editSlotStart,
      endTime: editSlotEnd,
      venue: editSlotVenue.trim() || 'LT 1',
      stream: editSlotStream === 'all' ? undefined : editSlotStream
    });

    setEditingSlot(null);
  };

  // Handle Edit Course Submit
  const handleEditCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    await updateCourse(editingCourse.id, {
      code: editCourseCode.toUpperCase().trim(),
      title: editCourseTitle.trim(),
      creditHours: Number(editCourseCredits),
      lecturer: editCourseLecturer.trim() || 'Department Lecturer'
    });

    setEditingCourse(null);
  };

  const filteredTimetable = timetable.filter((slot) => {
    if (selectedTimetableStream === 'all') return true;
    return !slot.stream || slot.stream === 'all' || slot.stream === selectedTimetableStream;
  });

  const visibleDays = includeSaturday ? DAYS_OF_WEEK : DAYS_OF_WEEK.slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#007c82] dark:text-teal-400 uppercase tracking-wider">
            <CalendarDays className="w-4 h-4" />
            Academic Planning & Timetable
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">Semester Timetable</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {semester.name} ({semester.academicYear}) · Assign your custom course names and days studied.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <button
              id="timetable-tab-schedule"
              onClick={() => setActiveTab('schedule')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-[#007c82] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Weekly Schedule ({timetable.length})
            </button>
            <button
              id="timetable-tab-courses"
              onClick={() => setActiveTab('courses')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'courses'
                  ? 'bg-[#007c82] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Course Catalog ({courses.length})
            </button>
          </div>

          <button
            id="assign-course-study-days-btn"
            onClick={() => {
              if (courses.length > 0) {
                setAssignMode('existing');
                setSelectedCourseId(courses[0].id);
              } else {
                setAssignMode('new');
              }
              setSelectedDays([1]);
              setShowAssignModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#007c82] hover:bg-[#00666b] text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Assign Course & Study Days
          </button>
        </div>
      </div>

      {/* Offline Status Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 dark:border-amber-700/50 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-100 flex items-center gap-2">
                <span>Offline Mode Active</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-bold">
                  Service Worker & Local Cache
                </span>
              </div>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                No internet connection detected. You are viewing your saved semester timetable ({timetable.length} sessions, {courses.length} courses) cached securely on this device.
              </p>
            </div>
          </div>
          <div className="text-xs font-semibold text-amber-800 dark:text-amber-300 shrink-0">
            Last saved: {offlineCacheInfo.cachedAtText}
          </div>
        </div>
      )}

      {isPoorConnection && isOnline && (
        <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 text-sky-900 dark:text-sky-200 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Wifi className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <p className="text-xs text-sky-800 dark:text-sky-300">
              <strong>Slow network detected:</strong> Timetable data is delivered from fast local storage cache for instant response.
            </p>
          </div>
          <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-900/60 px-2 py-0.5 rounded-md shrink-0">
            Fast Local Cache
          </span>
        </div>
      )}

      {/* Offline Caching & Student Pocket Schedule Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Offline Ready: {offlineCacheInfo.cachedAtText}</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden md:inline">
            {timetable.length} sessions & {courses.length} courses cached on your device
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {offlineSaveNotice && (
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg animate-in fade-in">
              {offlineSaveNotice}
            </span>
          )}

          <button
            onClick={handleManualSaveOffline}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Force refresh cached copy to browser storage"
          >
            <HardDriveDownload className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            <span>Save Offline Copy</span>
          </button>

          <button
            onClick={() => setShowPocketView(!showPocketView)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              showPocketView
                ? 'bg-[#007c82] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
            title="Compact student daily lecture agenda"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{showPocketView ? 'Standard View' : 'Student Pocket View'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Print or export timetable as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>
        </div>
      </div>

      {/* STUDENT POCKET SCHEDULE VIEW (Optimized for quick offline mobile reading) */}
      {showPocketView && activeTab === 'schedule' && (
        <div className="bg-gradient-to-br from-[#002840] to-[#003b5c] text-white p-5 rounded-3xl shadow-md border border-[#001f33] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#8dc63f] uppercase tracking-wider">
                <Smartphone className="w-3.5 h-3.5" />
                Student Pocket Schedule · Offline Ready
              </div>
              <h3 className="text-lg font-black text-white mt-0.5">
                Quick Lecture Agenda
              </h3>
              <p className="text-xs text-slate-300">
                Optimized high-contrast view for quick classroom checks on phones with poor connection.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold">
                Device Cached
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleDays.map((day) => {
              const daySlots = filteredTimetable
                .filter((t) => t.dayOfWeek === day.id)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

              return (
                <div
                  key={day.id}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-extrabold text-sm text-white tracking-wide">
                      {day.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/15 text-slate-200 font-semibold">
                      {daySlots.length} {daySlots.length === 1 ? 'class' : 'classes'}
                    </span>
                  </div>

                  {daySlots.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-3 text-center">
                      No classes scheduled
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {daySlots.map((slot) => {
                        const course = courses.find((c) => c.id === slot.courseId);
                        return (
                          <div
                            key={slot.id}
                            className="bg-black/25 rounded-xl p-3 border border-white/10 space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono font-bold text-[#8dc63f] bg-black/30 px-1.5 py-0.5 rounded">
                                {slot.startTime} – {slot.endTime}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-white text-xs">
                                  {course?.code || 'COURSE'}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/25 text-amber-300 font-bold border border-amber-400/30">
                                  {slot.stream || 'All Streams'}
                                </span>
                              </div>
                            </div>

                            <div className="text-xs font-semibold text-slate-200 truncate">
                              {course?.title || 'Unknown Course'}
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-white/5">
                              <div className="flex items-center gap-1 truncate max-w-[140px]">
                                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span className="truncate">{slot.venue || 'RCEES Lecture Hall'}</span>
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {course?.creditHours || 3} Credits
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEKLY TIMETABLE SCHEDULE VIEW */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          
          {/* Controls Bar: Stream Filter, Saturday Toggle & Clear Options */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 whitespace-nowrap">
                Division Filter:
              </span>
              <button
                onClick={() => setSelectedTimetableStream('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedTimetableStream === 'all'
                    ? 'bg-[#007c82] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All Divisions
              </button>
              {['IT A', 'IT B', 'IT C', 'IT D', 'IT E'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedTimetableStream(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedTimetableStream === st
                      ? 'bg-[#003b5c] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeSaturday}
                  onChange={(e) => setIncludeSaturday(e.target.checked)}
                  className="rounded border-slate-300 text-[#007c82] focus:ring-[#007c82]"
                />
                <span>Include Saturday</span>
              </label>

              {timetable.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm('schedule')}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Timetable
                </button>
              )}
            </div>
          </div>

          {/* Empty State when no timetable slots exist */}
          {timetable.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-10 text-center space-y-4 max-w-xl mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#007c82] flex items-center justify-center mx-auto shadow-xs">
                <CalendarDays className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Your Timetable is Empty</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  You have full freedom to assign your own courses, course codes, lecturers, and specify which days of the week they are studied.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setAssignMode('new');
                    setSelectedDays([1]);
                    setShowAssignModal(true);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#007c82] hover:bg-[#00666b] text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Assign Your First Course & Study Days
                </button>
              </div>
            </div>
          ) : (
            /* Multi-Day Column Grid */
            <div className={`grid grid-cols-1 md:grid-cols-${visibleDays.length} gap-4`}>
              {visibleDays.map((day) => {
                const daySlots = filteredTimetable
                  .filter((slot) => slot.dayOfWeek === day.id)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime));

                return (
                  <div
                    key={day.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    {/* Day Header */}
                    <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">{day.name}</h3>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {daySlots.length} {daySlots.length === 1 ? 'lecture' : 'lectures'}
                        </span>
                      </div>
                      <button
                        onClick={() => openAssignModalForDay(day.id)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#007c82] dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-700 hover:border-teal-300 flex items-center justify-center transition-colors cursor-pointer"
                        title={`Add lecture to ${day.name}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Day Slots */}
                    <div className="p-3 flex-1 space-y-2.5 min-h-[220px]">
                      {daySlots.length === 0 ? (
                        <div className="h-full min-h-[180px] flex flex-col items-center justify-center text-center p-4 text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                          <span>No classes on {day.name}</span>
                          <button
                            onClick={() => openAssignModalForDay(day.id)}
                            className="text-[11px] font-bold text-[#007c82] dark:text-teal-400 hover:underline cursor-pointer"
                          >
                            + Add to {day.name}
                          </button>
                        </div>
                      ) : (
                        daySlots.map((slot) => {
                          const course = courses.find((c) => c.id === slot.courseId);
                          return (
                            <div
                              key={slot.id}
                              className="bg-gradient-to-br from-teal-50/50 via-white to-slate-50 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-900 border border-teal-200/80 dark:border-slate-700/80 rounded-xl p-3 space-y-2 shadow-xs relative group hover:border-[#007c82] dark:hover:border-teal-400 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-black text-[#007c82] dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-100 dark:border-teal-900/50">
                                    {course?.code || 'COURSE'}
                                  </span>
                                  {slot.stream && slot.stream !== 'all' ? (
                                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                      {slot.stream}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                      All Streams
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => {
                                      setEditingSlot(slot);
                                      setEditSlotCourseId(slot.courseId);
                                      setEditSlotDay(slot.dayOfWeek);
                                      setEditSlotStart(slot.startTime);
                                      setEditSlotEnd(slot.endTime);
                                      setEditSlotVenue(slot.venue);
                                      setEditSlotStream(slot.stream || 'all');
                                    }}
                                    className="text-slate-400 hover:text-[#007c82] dark:hover:text-teal-400 p-0.5 cursor-pointer"
                                    title="Edit slot"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => removeTimetableSlot(slot.id)}
                                    className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 cursor-pointer"
                                    title="Remove slot"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                                {course?.title || 'Unknown Course'}
                              </div>

                              {course?.lecturer && (
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                                  <User className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{course.lecturer}</span>
                                </div>
                              )}

                              <div className="pt-2 border-t border-slate-200/60 space-y-1 text-[11px] text-slate-600">
                                <div className="flex items-center gap-1 font-medium text-slate-700">
                                  <Clock className="w-3 h-3 text-[#007c82] shrink-0" />
                                  {slot.startTime} – {slot.endTime}
                                </div>
                                <div className="flex items-center gap-1 text-slate-500 truncate">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{slot.venue}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Bottom Add Link */}
                    {daySlots.length > 0 && (
                      <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-center">
                        <button
                          onClick={() => openAssignModalForDay(day.id)}
                          className="text-[11px] font-bold text-[#007c82] hover:text-[#005b60] flex items-center justify-center gap-1 w-full py-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          Add Class to {day.short}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* COURSE CATALOG VIEW */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <BookOpen className="w-4 h-4 text-[#007c82] dark:text-teal-400" />
              <span>
                Manage your department courses, configure lecture days, or update course credit hours.
              </span>
            </div>

            {courses.length > 0 && (
              <button
                onClick={() => setShowClearConfirm('courses')}
                className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All Courses
              </button>
            )}
          </div>

          {courses.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-10 text-center space-y-4 max-w-xl mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-[#007c82] dark:text-teal-400 flex items-center justify-center mx-auto shadow-xs">
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Courses Registered</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Add your custom course names and assign which days they are studied.
                </p>
              </div>
              <button
                onClick={() => {
                  setAssignMode('new');
                  setSelectedDays([1]);
                  setShowAssignModal(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#007c82] hover:bg-[#00666b] text-white text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Your First Course
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => {
                const assignedSlots = timetable.filter((s) => s.courseId === course.id);
                const assignedDayNames = assignedSlots
                  .map((s) => DAYS_OF_WEEK.find((d) => d.id === s.dayOfWeek)?.short)
                  .filter(Boolean);

                return (
                  <div
                    key={course.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-black text-[#007c82] dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-100 dark:border-teal-900/50">
                          {course.code}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingCourse(course);
                              setEditCourseCode(course.code);
                              setEditCourseTitle(course.title);
                              setEditCourseCredits(course.creditHours);
                              setEditCourseLecturer(course.lecturer);
                            }}
                            className="p-1 text-slate-400 hover:text-[#007c82] dark:hover:text-teal-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit course"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeCourse(course.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Delete course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-2 leading-tight">
                        {course.title}
                      </h4>

                      <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{course.lecturer}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                          <span>{course.creditHours} Credit Hours</span>
                        </div>
                      </div>
                    </div>

                    {/* Schedule status & quick schedule button */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate">
                        {assignedDayNames.length > 0 ? (
                          <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/50">
                            Studied: {assignedDayNames.join(', ')} ({assignedSlots.length} session{assignedSlots.length > 1 ? 's' : ''})
                          </span>
                        ) : (
                          <span className="text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-100 dark:border-amber-900/50">
                            Not scheduled yet
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => openAssignModalForCourse(course)}
                        className="text-xs font-bold text-[#007c82] dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800 transition-colors cursor-pointer shrink-0"
                      >
                        + Schedule Days
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* UNIFIED MODAL: ASSIGN COURSE & STUDY DAYS */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 my-8">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black text-[#007c82] uppercase tracking-wider">
                  Academic Scheduling
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Assign Course & Study Days
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Specify course details and choose which days of the week it will be studied.
                </p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Course Mode Selector */}
            {courses.length > 0 && (
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setAssignMode('new')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    assignMode === 'new'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create New Course & Assign
                </button>
                <button
                  type="button"
                  onClick={() => setAssignMode('existing')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    assignMode === 'existing'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Choose From Catalog ({courses.length})
                </button>
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              {/* If choosing existing course */}
              {assignMode === 'existing' && courses.length > 0 ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Course
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#007c82]"
                    required
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} – {c.title} ({c.lecturer})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                /* Fields for New Course */
                <div className="space-y-3 bg-slate-50/60 p-4 rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Course Code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. IT 308"
                        value={courseCode}
                        onChange={(e) => setCourseCode(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#007c82]"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Course Name / Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Artificial Intelligence & Expert Systems"
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#007c82]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Lecturer in Charge
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Dr. Kwabena Asante"
                        value={lecturer}
                        onChange={(e) => setLecturer(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#007c82]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Credit Hours
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={6}
                        value={creditHours}
                        onChange={(e) => setCreditHours(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#007c82]"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Study Days Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Days Studied (Select All That Apply)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = selectedDays.includes(day.id);
                    return (
                      <button
                        type="button"
                        key={day.id}
                        onClick={() => toggleDaySelection(day.id)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? 'bg-[#007c82] text-white border-[#007c82] shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span>{day.short}</span>
                        {isSelected && <Check className="w-3 h-3 text-teal-200" />}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  You can select multiple days if this course meets more than once a week.
                </p>
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Class Time
                  </label>
                  <span className="text-[10px] text-slate-400">Quick Presets:</span>
                </div>

                {/* Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {TIME_PRESETS.map((p) => (
                    <button
                      type="button"
                      key={p.label}
                      onClick={() => {
                        setStartTime(p.start);
                        setEndTime(p.end);
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium cursor-pointer transition-colors ${
                        startTime === p.start && endTime === p.end
                          ? 'bg-teal-50 border-[#007c82] text-[#007c82] font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#007c82]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#007c82]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Venue Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Lecture Hall / Venue
                </label>
                <input
                  type="text"
                  placeholder="e.g. LT 2 - Sunyani Campus"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#007c82] mb-1.5"
                  required
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  {VENUE_PRESETS.map((v) => (
                    <button
                      type="button"
                      key={v}
                      onClick={() => setVenue(v)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 cursor-pointer"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Stream / Division */}
              <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-200">
                <label className="block text-xs font-bold text-[#007c82] uppercase tracking-wider mb-1">
                  Target Stream / Class Division
                </label>
                <select
                  value={slotStream}
                  onChange={(e) => setSlotStream(e.target.value)}
                  className="w-full bg-white border border-teal-300 rounded-xl px-3 py-2 text-xs font-bold text-[#007c82] focus:outline-none focus:ring-2 focus:ring-[#007c82]"
                >
                  <option value="all">All Divisions (Shared Cohort Lecture)</option>
                  <option value="IT A">Division IT A Only</option>
                  <option value="IT B">Division IT B Only</option>
                  <option value="IT C">Division IT C Only</option>
                  <option value="IT D">Division IT D Only</option>
                  <option value="IT E">Division IT E Only</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Choose a division if this is a separate group lecture (e.g. IT A only), or leave as All Divisions.
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#007c82] hover:bg-[#00666b] rounded-xl shadow-sm cursor-pointer"
                >
                  Save & Assign to Timetable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SLOT MODAL */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Edit Class Session</h3>
                <p className="text-xs text-slate-500">Update the scheduled time, venue, or day.</p>
              </div>
              <button
                onClick={() => setEditingSlot(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSlotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Course
                </label>
                <select
                  value={editSlotCourseId}
                  onChange={(e) => setEditSlotCourseId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                  required
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} – {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Day of Week
                </label>
                <select
                  value={editSlotDay}
                  onChange={(e) => setEditSlotDay(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                  required
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={editSlotStart}
                    onChange={(e) => setEditSlotStart(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={editSlotEnd}
                    onChange={(e) => setEditSlotEnd(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Venue
                </label>
                <input
                  type="text"
                  value={editSlotVenue}
                  onChange={(e) => setEditSlotVenue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Stream / Division
                </label>
                <select
                  value={editSlotStream}
                  onChange={(e) => setEditSlotStream(e.target.value)}
                  className="w-full bg-teal-50 border border-teal-300 rounded-xl px-3 py-2 text-xs font-bold text-[#007c82]"
                >
                  <option value="all">All Divisions (Shared)</option>
                  <option value="IT A">Division IT A</option>
                  <option value="IT B">Division IT B</option>
                  <option value="IT C">Division IT C</option>
                  <option value="IT D">Division IT D</option>
                  <option value="IT E">Division IT E</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#007c82] hover:bg-[#00666b] rounded-xl shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COURSE MODAL */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Edit Course Details</h3>
                <p className="text-xs text-slate-500">Update course code, title, or assigned lecturer.</p>
              </div>
              <button
                onClick={() => setEditingCourse(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditCourseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  value={editCourseCode}
                  onChange={(e) => setEditCourseCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Course Name / Title
                </label>
                <input
                  type="text"
                  value={editCourseTitle}
                  onChange={(e) => setEditCourseTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Credit Hours
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={editCourseCredits}
                    onChange={(e) => setEditCourseCredits(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Lecturer Name
                  </label>
                  <input
                    type="text"
                    value={editCourseLecturer}
                    onChange={(e) => setEditCourseLecturer(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#007c82] hover:bg-[#00666b] rounded-xl shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR CLEARING */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {showClearConfirm === 'schedule' ? 'Clear Weekly Timetable?' : 'Clear All Courses?'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {showClearConfirm === 'schedule'
                  ? 'This will remove all scheduled lecture slots from Monday through Saturday.'
                  : 'This will remove all courses and their corresponding timetable slots.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (showClearConfirm === 'schedule') {
                    await clearAllTimetableSlots();
                  } else {
                    await clearAllCourses();
                  }
                  setShowClearConfirm(null);
                }}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
