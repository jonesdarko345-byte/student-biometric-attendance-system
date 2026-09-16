import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student, DEFAULT_STREAMS } from '../types';
import { BiometricEnrollment } from '../components/BiometricEnrollment';
import { AuditLogPanel } from '../components/AuditLogPanel';
import { AuthorizedPersonnelPanel } from '../components/AuthorizedPersonnelPanel';
import { AutoLoggingSettingsPanel } from '../components/AutoLoggingSettingsPanel';
import {
  Users,
  UserPlus,
  Fingerprint,
  Trash2,
  Search,
  Upload,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  GraduationCap,
  RotateCcw,
  Sparkles,
  Sliders,
  ShieldCheck,
  Layers,
  Filter
} from 'lucide-react';

export const Admin: React.FC = () => {
  const {
    students,
    addStudent,
    batchAddStudents,
    removeStudent,
    clearAllStudents,
    authorizedUsers,
    currentUser,
    adminSubTab,
    setAdminSubTab
  } = useApp();

  const [selectedStudentForBio, setSelectedStudentForBio] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStreamFilter, setSelectedStreamFilter] = useState<string>('all');

  // Add single student form
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [indexNumber, setIndexNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [program, setProgram] = useState<string>('BSc Information Technology');
  const [level, setLevel] = useState<string>('Level 100');
  const [stream, setStream] = useState<string>('IT A');
  const [formError, setFormError] = useState<string>('');

  // Batch import modal
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);
  const [batchText, setBatchText] = useState<string>('');
  const [batchDefaultStream, setBatchDefaultStream] = useState<string>('IT A');
  const [batchResultMsg, setBatchResultMsg] = useState<string>('');

  // Dynamic streams collection
  const availableStreams = Array.from(
    new Set([
      ...DEFAULT_STREAMS,
      ...students.map((s) => s.stream).filter((st): st is string => Boolean(st))
    ])
  );

  // If enrolling biometrics for a student, render BiometricEnrollment view
  if (selectedStudentForBio) {
    const updatedStudent = students.find((s) => s.id === selectedStudentForBio.id) || selectedStudentForBio;
    return (
      <BiometricEnrollment
        student={updatedStudent}
        onBack={() => setSelectedStudentForBio(null)}
      />
    );
  }

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !indexNumber.trim()) {
      setFormError('Please provide both full name and index number.');
      return;
    }

    const cleanIdx = indexNumber.toUpperCase().trim();
    if (students.some((s) => s.indexNumber === cleanIdx)) {
      setFormError('A student with this index number already exists.');
      return;
    }

    addStudent({
      name: name.trim(),
      indexNumber: cleanIdx,
      email: email.trim() || `${cleanIdx.toLowerCase()}@uenr.edu.gh`,
      program,
      level,
      stream
    });

    setName('');
    setIndexNumber('');
    setEmail('');
    setFormError('');
    setShowAddModal(false);
  };

  const handleBatchImport = async () => {
    if (!batchText.trim()) return;

    // Parse lines (support CSV: Name, IndexNumber, Email, Stream or Name, IndexNumber, Stream)
    const lines = batchText.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsed: Array<{ name: string; indexNumber: string; email?: string; stream?: string }> = [];

    lines.forEach((line) => {
      if (line.toLowerCase().startsWith('name') || line.toLowerCase().startsWith('index')) return;

      const parts = line.split(/[,\t]+/).map((p) => p.trim());
      if (parts.length >= 2) {
        let studentEmail = parts[2];
        let studentStream = parts[3];

        // If 3rd part looks like stream (e.g. IT A, IT B, Stream A) and doesn't have @
        if (parts[2] && !parts[2].includes('@') && (parts[2].toLowerCase().includes('it') || parts[2].toLowerCase().includes('stream'))) {
          studentStream = parts[2];
          studentEmail = undefined;
        }

        parsed.push({
          name: parts[0],
          indexNumber: parts[1].toUpperCase(),
          email: studentEmail,
          stream: studentStream || batchDefaultStream
        });
      }
    });

    if (parsed.length === 0) {
      setBatchResultMsg('No valid student rows found. Format: Full Name, Index Number (e.g. Kwame Boateng, UEB3100122, IT A)');
      return;
    }

    const importedCount = await batchAddStudents(parsed);
    setBatchResultMsg(`Successfully imported ${importedCount} student(s) into class roster (${batchDefaultStream}).`);
    setBatchText('');
    setTimeout(() => {
      setShowBatchModal(false);
      setBatchResultMsg('');
    }, 1800);
  };

  const handleDelete = (student: Student) => {
    if (confirm(`Remove student ${student.name} (${student.indexNumber}) from the class roster?`)) {
      removeStudent(student.id);
    }
  };

  const handleClearAll = () => {
    if (students.length === 0) return;
    if (
      confirm(
        `Are you sure you want to remove ALL ${students.length} students from the roster? This cannot be undone.`
      )
    ) {
      clearAllStudents();
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.indexNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStream =
      selectedStreamFilter === 'all' || (s.stream || 'IT A') === selectedStreamFilter;
    return matchesSearch && matchesStream;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#007c82] dark:text-teal-400 uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            Class Management & Security
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">Roster & Access Governance</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage your class student list, enroll biometrics, and authorize Faculty / Class Reps.
          </p>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => setAdminSubTab('roster')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                adminSubTab === 'roster'
                  ? 'bg-[#007c82] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Class Roster ({students.length})</span>
            </button>

            <button
              onClick={() => setAdminSubTab('authorized')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                adminSubTab === 'authorized'
                  ? 'bg-[#007c82] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Authorized Staff & Reps ({authorizedUsers.length})</span>
            </button>

            <button
              onClick={() => setAdminSubTab('audit')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                adminSubTab === 'audit'
                  ? 'bg-[#007c82] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>System Audit</span>
            </button>

            <button
              onClick={() => setAdminSubTab('autologging')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                adminSubTab === 'autologging'
                  ? 'bg-[#007c82] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Auto-Logging Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-tab 1: Authorized Staff & Class Reps */}
      {adminSubTab === 'authorized' && <AuthorizedPersonnelPanel />}

      {/* Sub-tab 2: Audit Logs */}
      {adminSubTab === 'audit' && <AuditLogPanel />}

      {/* Sub-tab 3: Auto-Logging & Policy Settings */}
      {adminSubTab === 'autologging' && <AutoLoggingSettingsPanel />}

      {/* Sub-tab 3: Student Roster */}
      {adminSubTab === 'roster' && (
        <div className="space-y-4">
          
          {/* Action Header for Roster */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-[#007c82] dark:text-teal-400 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Registered Students</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {students.length === 0
                    ? 'No students registered. Add your class roster below.'
                    : `${students.length} student(s) currently registered in this class.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              {students.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Clear all students"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}

              <button
                onClick={() => setShowBatchModal(true)}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Batch Import</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl bg-[#003b5c] hover:bg-[#002d47] text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Student</span>
              </button>
            </div>
          </div>

          {/* If No Students: Clean, Helpful Empty State */}
          {students.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-8 sm:p-12 text-center shadow-sm max-w-2xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-[#007c82] dark:text-teal-400 flex items-center justify-center mx-auto border border-teal-100 dark:border-teal-900/50 shadow-inner">
                <Users className="w-8 h-8" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your Class Roster is Clean</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  You requested a fresh start with no pre-filled students. You can now add your own class students individually or import the entire class list at once.
                </p>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#003b5c] hover:bg-[#002d47] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add First Student</span>
                </button>

                <button
                  onClick={() => setShowBatchModal(true)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Batch Import (CSV / Paste List)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              
              {/* Stream Navigation Tabs */}
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-850 flex items-center gap-2 overflow-x-auto">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mr-2 flex-shrink-0">
                  <Layers className="w-3.5 h-3.5 text-[#007c82] dark:text-teal-400" />
                  <span>Divisions:</span>
                </div>
                <button
                  onClick={() => setSelectedStreamFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedStreamFilter === 'all'
                      ? 'bg-[#007c82] text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  All Streams ({students.length})
                </button>
                {availableStreams.map((st) => {
                  const count = students.filter((s) => (s.stream || 'IT A') === st).length;
                  const isActive = selectedStreamFilter === st;
                  return (
                    <button
                      key={st}
                      onClick={() => setSelectedStreamFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#003b5c] text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span>{st}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Filter Bar */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="relative max-w-md w-full">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search student name or index number (UEB...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#007c82]"
                  />
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Showing <strong className="text-slate-800 dark:text-slate-200">{filteredStudents.length}</strong> of{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{students.length}</strong> students
                  {selectedStreamFilter !== 'all' && (
                    <span className="ml-1 text-[#007c82] dark:text-teal-400 font-bold">
                      (Filtered by {selectedStreamFilter})
                    </span>
                  )}
                </div>
              </div>

              {/* Students Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-4">#</th>
                      <th className="py-3.5 px-4">Student Name</th>
                      <th className="py-3.5 px-4">Stream</th>
                      <th className="py-3.5 px-4">Index Number</th>
                      <th className="py-3.5 px-4">Email / Contact</th>
                      <th className="py-3.5 px-4">Biometric Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                          No matching students found for &quot;{searchQuery}&quot;{selectedStreamFilter !== 'all' ? ` in ${selectedStreamFilter}` : ''}.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student, idx) => {
                        const fingerCount = student.enrolledFingers?.length || 0;
                        return (
                          <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-3.5 px-4 font-mono text-xs text-slate-400 dark:text-slate-500">
                              {idx + 1}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900 dark:text-white">{student.name}</div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">{student.program} · {student.level}</div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950/60 text-[#007c82] dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-black font-mono">
                                {student.stream || 'IT A'}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                              {student.indexNumber}
                            </td>

                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-xs">
                              {student.email}
                            </td>

                            <td className="py-3.5 px-4">
                              {fingerCount > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  {fingerCount}/10 Fingers Enrolled
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-medium">
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                  Not Enrolled
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelectedStudentForBio(student)}
                                  className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-[#007c82] dark:text-teal-400 border border-teal-200 dark:border-teal-800 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Enroll Fingerprints"
                                >
                                  <Fingerprint className="w-3.5 h-3.5" />
                                  <span>{fingerCount > 0 ? 'Edit Biometrics' : 'Enroll Fingerprint'}</span>
                                </button>

                                <button
                                  onClick={() => handleDelete(student)}
                                  className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                  title="Delete Student"
                                >
                                  <Trash2 className="w-4 h-4" />
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
            </div>
          )}
        </div>
      )}

      {/* Add Single Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-[#003b5c] p-5 text-white">
              <h3 className="font-bold text-lg">Add New Student</h3>
              <p className="text-xs text-slate-200 mt-0.5">
                Enter student details to add them to the official UENR class roster.
              </p>
            </div>

            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              {formError && (
                <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl p-3 text-xs text-rose-700 dark:text-rose-300 font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Samuel Nana Yaw"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#007c82]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Index Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. UEB3101522"
                  value={indexNumber}
                  onChange={(e) => setIndexNumber(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#007c82]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  placeholder="student@uenr.edu.gh"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#007c82]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Program
                  </label>
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#007c82]"
                  >
                    <option value="BSc Information Technology">BSc Information Technology</option>
                    <option value="BSc Computer Science">BSc Computer Science</option>
                    <option value="BSc Computer Engineering">BSc Computer Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#007c82]"
                  >
                    <option value="Level 100">Level 100</option>
                    <option value="Level 200">Level 200</option>
                    <option value="Level 300">Level 300</option>
                    <option value="Level 400">Level 400</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Stream / Division *
                  </label>
                  <select
                    value={stream}
                    onChange={(e) => setStream(e.target.value)}
                    className="w-full bg-teal-50/70 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-700 rounded-xl px-2.5 py-2 text-xs font-bold text-[#007c82] dark:text-teal-300 focus:outline-none focus:ring-2 focus:ring-[#007c82]"
                  >
                    <option value="IT A">IT A</option>
                    <option value="IT B">IT B</option>
                    <option value="IT C">IT C</option>
                    <option value="IT D">IT D</option>
                    <option value="IT E">IT E</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#007c82] hover:bg-[#00666b] rounded-xl shadow-sm cursor-pointer"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Import Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-[#003b5c] p-5 text-white">
              <h3 className="font-bold text-lg">Batch Import Students</h3>
              <p className="text-xs text-slate-200 mt-0.5">
                Paste student records from Excel, Google Sheets, or CSV (Name, Index Number).
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {batchResultMsg && (
                <div className="bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 rounded-xl p-3 text-teal-800 dark:text-teal-300 font-semibold">
                  {batchResultMsg}
                </div>
              )}

              {/* Stream target for batch import */}
              <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Assign Stream / Class Division:
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Applied to all imported rows without an explicit stream column
                  </p>
                </div>
                <select
                  value={batchDefaultStream}
                  onChange={(e) => setBatchDefaultStream(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-teal-300 dark:border-teal-700 rounded-lg px-3 py-1.5 text-xs font-bold text-[#007c82] dark:text-teal-300 focus:outline-none focus:ring-2 focus:ring-[#007c82]"
                >
                  <option value="IT A">IT A (Division A)</option>
                  <option value="IT B">IT B (Division B)</option>
                  <option value="IT C">IT C (Division C)</option>
                  <option value="IT D">IT D (Division D)</option>
                  <option value="IT E">IT E (Division E)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Format: Full Name, Index Number, [Optional Stream] (One per line)
                </label>
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-[11px] text-slate-600 dark:text-slate-300 mb-2">
                  Kwame Mensah, UEB3100122, IT A<br />
                  Ama Serwaa, UEB3100222, IT A<br />
                  Kofi Osei, UEB3100322, IT B
                </div>
                <textarea
                  rows={8}
                  value={batchText}
                  onChange={(e) => setBatchText(e.target.value)}
                  placeholder="Paste lines here..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#007c82]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBatchImport}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#007c82] hover:bg-[#00666b] rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import Records</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
