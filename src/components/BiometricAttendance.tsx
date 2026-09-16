import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student, Course } from '../types';
import { Fingerprint, CheckCircle2, AlertCircle, Sparkles, RefreshCw, UserCheck, ShieldCheck, Lock } from 'lucide-react';

interface BiometricAttendanceProps {
  date: string;
  course: Course;
  presentStudentIds: string[];
  isSessionFinalized: boolean;
  stream?: string;
  onAttendanceMarked: (studentId: string) => void;
  onFinalizeSession: () => void;
}

export const BiometricAttendance: React.FC<BiometricAttendanceProps> = ({
  date,
  course,
  presentStudentIds,
  isSessionFinalized,
  stream,
  onAttendanceMarked,
  onFinalizeSession,
}) => {
  const { students, autoLoggingSettings, addAuditLog } = useApp();
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [lastVerifiedStudent, setLastVerifiedStudent] = useState<Student | null>(null);
  const [scanMessage, setScanMessage] = useState<string>('Ready for student biometric scan');

  // Filter students based on selected stream division
  const activeStudents = stream && stream !== 'all'
    ? students.filter((s) => s.stream === stream)
    : students;

  // Play a pleasant high-pitch beep on biometric match
  const playMatchSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15); // E6
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio not supported or blocked by browser
    }
  };

  const handleScan = (studentToScan?: Student) => {
    if (isSessionFinalized) return;

    let targetStudent: Student | undefined = studentToScan;
    if (!targetStudent && selectedStudentId) {
      targetStudent = activeStudents.find((s) => s.id === selectedStudentId);
    }
    if (!targetStudent) {
      // Pick first enrolled student in this stream not yet present, or any student
      const enrolledNotPresent = activeStudents.find(
        (s) => s.enrolledFingers && s.enrolledFingers.length > 0 && !presentStudentIds.includes(s.id)
      );
      targetStudent = enrolledNotPresent || activeStudents[0];
    }

    if (!targetStudent) return;

    setIsScanning(true);
    setScanMessage('Scanning fingerprint sensor...');

    setTimeout(() => {
      setIsScanning(false);
      setLastVerifiedStudent(targetStudent!);
      playMatchSound();
      setScanMessage(`Verified: ${targetStudent!.name} (Confidence: 99.4%)`);
      onAttendanceMarked(targetStudent!.id);
      setSelectedStudentId('');
      if (autoLoggingSettings.autoLogBiometricScanSuccess) {
        addAuditLog(
          'Biometric Check-In Recorded',
          `${targetStudent!.name} (${targetStudent!.indexNumber}) biometrically verified for ${course.code}`,
          'biometric'
        );
      }
    }, 1200);
  };

  const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const enrolledStudents = activeStudents.filter((s) => s.enrolledFingers && s.enrolledFingers.length > 0);
  const presentCount = presentStudentIds.length;
  const totalStudents = activeStudents.length;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003b5c] via-[#006b78] to-[#007c82] p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              Real-time Biometric Terminal
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mt-1">Biometric Attendance Scanning</h2>
            <p className="text-slate-200 text-xs sm:text-sm mt-0.5">
              Course: <strong className="text-white">{course.code} – {course.title}</strong> · {formattedDate}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-center flex-shrink-0">
            <div className="text-2xl font-black text-emerald-300">
              {presentCount} / {totalStudents}
            </div>
            <div className="text-[11px] text-slate-200 font-medium">
              Students Marked Present
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isSessionFinalized && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center gap-3 text-amber-900">
            <Lock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-bold">Session Finalized:</span> Attendance for this weekday course session is locked. No further biometric marks can be registered unless unlocked.
            </div>
          </div>
        )}

        {/* Interactive Biometric Scanner Station */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Left Column: Live Fingerprint Touchpad Simulator */}
          <div className="md:col-span-6 bg-slate-900 rounded-2xl p-6 text-white text-center flex flex-col items-center justify-center relative overflow-hidden border border-slate-800 shadow-inner min-h-[320px]">
            <div className="absolute top-3 left-4 text-[10px] font-mono text-emerald-400">
              TERMINAL ID: UENR-BIO-04 · READY
            </div>

            <div className="my-5 relative group cursor-pointer" onClick={() => !isScanning && !isSessionFinalized && handleScan()}>
              {/* Ripple animation when scanning */}
              {isScanning && (
                <>
                  <div className="absolute -inset-3 rounded-full bg-emerald-500/30 animate-ping" />
                  <div className="absolute -inset-8 rounded-full bg-teal-500/15 animate-pulse" />
                </>
              )}

              <div
                className={`w-32 h-32 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 border-2 ${
                  isSessionFinalized
                    ? 'bg-slate-800 border-slate-700 opacity-60 cursor-not-allowed'
                    : isScanning
                    ? 'bg-emerald-950/80 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.5)]'
                    : 'bg-slate-800 hover:bg-slate-750 border-teal-500/50 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                }`}
              >
                <Fingerprint
                  className={`w-16 h-16 transition-colors duration-300 ${
                    isScanning
                      ? 'text-emerald-400 animate-pulse'
                      : isSessionFinalized
                      ? 'text-slate-500'
                      : 'text-teal-300 group-hover:text-emerald-300'
                  }`}
                />
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mt-1">
                  {isScanning ? 'CAPTURING' : 'TOUCH TO SCAN'}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-semibold text-white">
                {students.length === 0 ? (
                  <span className="text-amber-300">No students registered in class roster yet</span>
                ) : isScanning ? (
                  <span className="flex items-center justify-center gap-2 text-emerald-400">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Scanning student biometric signature...
                  </span>
                ) : (
                  <span className="text-slate-200">{scanMessage}</span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {students.length === 0
                  ? 'Add students in Student Roster to begin taking biometric roll calls'
                  : 'Click pad directly or select a student below to simulate optical sensor touch'}
              </p>
            </div>

            {/* Quick action button */}
            <button
              onClick={() => handleScan()}
              disabled={isScanning || isSessionFinalized || students.length === 0}
              className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider shadow-md disabled:opacity-50 transition-all cursor-pointer"
            >
              {students.length === 0 ? 'Roster Empty' : isScanning ? 'Verifying...' : 'Simulate Finger Scan'}
            </button>
          </div>

          {/* Right Column: Verification Result Card */}
          <div className="md:col-span-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Last Biometric Verification
            </h3>

            {lastVerifiedStudent ? (
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                    {lastVerifiedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{lastVerifiedStudent.name}</h4>
                    <p className="text-xs font-mono font-bold text-emerald-800">
                      Index No: {lastVerifiedStudent.indexNumber}
                    </p>
                    <p className="text-xs text-slate-600">{lastVerifiedStudent.program}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Attendance Recorded for this session
                  </span>
                  <span className="text-slate-500">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 text-center text-slate-500 space-y-2">
                <UserCheck className="w-10 h-10 mx-auto text-slate-400 stroke-1" />
                <p className="text-sm font-medium">No biometric verification yet</p>
                <p className="text-xs text-slate-400">
                  Tap the fingerprint sensor to verify students as they enter the classroom.
                </p>
              </div>
            )}

            {/* Quick Student Selector */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Select Student for Biometric Verification:
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  disabled={isSessionFinalized}
                  className="flex-1 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#007c82]"
                >
                  <option value="">-- Choose student from class roster --</option>
                  {students.map((student) => {
                    const isPresent = presentStudentIds.includes(student.id);
                    const isEnrolled = student.enrolledFingers && student.enrolledFingers.length > 0;
                    return (
                      <option key={student.id} value={student.id}>
                        {student.name} ({student.indexNumber}) {isPresent ? '✓ [Present]' : ''} {!isEnrolled ? '⚠️ [No Fingerprint]' : ''}
                      </option>
                    );
                  })}
                </select>
                <button
                  onClick={() => handleScan()}
                  disabled={!selectedStudentId || isScanning || isSessionFinalized}
                  className="px-4 py-2 bg-[#007c82] hover:bg-[#00666b] text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Attendance List / Status */}
        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800">
              Session Attendance Roster ({presentCount} / {totalStudents} Present)
            </h3>
            <span className="text-xs text-slate-500">
              {enrolledStudents.length} of {students.length} students have biometric templates
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {activeStudents.map((student) => {
              const isPresent = presentStudentIds.includes(student.id);
              const isEnrolled = student.enrolledFingers && student.enrolledFingers.length > 0;
              return (
                <div
                  key={student.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                    isPresent
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="font-semibold truncate">{student.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{student.indexNumber}</div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {isPresent ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> Present
                      </span>
                    ) : (
                      <button
                        onClick={() => handleScan(student)}
                        disabled={isSessionFinalized || isScanning}
                        className="px-2 py-1 rounded bg-white hover:bg-teal-50 border border-slate-300 text-slate-700 text-[10px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Mark Scan
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Finalize Session Footer */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            Finalization locks this weekday session to prevent further unauthorized manual or biometric alterations.
          </p>
          <button
            onClick={onFinalizeSession}
            disabled={isSessionFinalized}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer ${
              isSessionFinalized
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-[#003b5c] hover:bg-[#002d47] text-white'
            }`}
          >
            {isSessionFinalized ? 'Session Already Finalized' : 'Finalize Attendance Session'}
          </button>
        </div>
      </div>
    </div>
  );
};
