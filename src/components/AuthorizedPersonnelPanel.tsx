import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AuthorizedUser, UserRole } from '../types';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Building2,
  GraduationCap,
  Users,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Mail,
  BookOpen
} from 'lucide-react';

export const AuthorizedPersonnelPanel: React.FC = () => {
  const { authorizedUsers, addAuthorizedUser, removeAuthorizedUser, currentUser } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('lecturer');
  const [department, setDepartment] = useState('Department of Information Technology');
  const [assignedInfo, setAssignedInfo] = useState('');
  const [assignedStream, setAssignedStream] = useState('IT A');
  const [formError, setFormError] = useState('');

  const isHod = currentUser.role === 'hod';

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !email.trim()) {
      setFormError('Please enter both full name and Google email address.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (authorizedUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      setFormError('This email is already in the authorized registry.');
      return;
    }

    await addAuthorizedUser({
      name: name.trim(),
      email: cleanEmail,
      role,
      department,
      courseAssigned: role === 'lecturer' ? assignedInfo.trim() : undefined,
      level: role === 'class_rep' ? assignedInfo.trim() : undefined,
      stream: role === 'class_rep' ? assignedStream : undefined
    });

    setName('');
    setEmail('');
    setAssignedInfo('');
    setAssignedStream('IT A');
    setShowAddModal(false);
  };

  const getRoleBadge = (userRole: UserRole) => {
    switch (userRole) {
      case 'hod':
        return {
          label: 'Head of Department (HOD)',
          icon: Building2,
          color: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      case 'class_rep':
        return {
          label: 'Class Representative',
          icon: GraduationCap,
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'lecturer':
      default:
        return {
          label: 'Course Lecturer',
          icon: Users,
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#003b5c] to-[#006080] rounded-2xl p-6 text-white shadow-md border border-teal-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 text-emerald-300">
            <KeyRound className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Institutional Access Control
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 font-semibold">
                Whitelist Protected
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Authorized Personnel & Portal Access
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
              Only Google accounts listed here can log into this system. Regular students are strictly blocked at the security gate.
            </p>
          </div>
        </div>

        {isHod && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Authorize New Personnel</span>
          </button>
        )}
      </div>

      {/* Access Rule Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-slate-800 dark:text-slate-100">Head of Department (HOD)</p>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Authorizes Lecturers and Class Reps, manages semester syllabus and overrides locked sessions.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-slate-800 dark:text-slate-100">Course Lecturers</p>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Mark attendance, run biometric verification, view analytics, and export student reports.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-slate-800 dark:text-slate-100">Class Representatives</p>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Assist in taking roll calls for scheduled class sessions and registering classmates&apos; fingerprints.</p>
          </div>
        </div>
      </div>

      {/* Whitelist Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Approved Access Registry</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {authorizedUsers.length} authorized user(s) currently permitted to access this portal
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Firestore Sync Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-6">Name & Google Email</th>
                <th className="py-3.5 px-6">Assigned Role</th>
                <th className="py-3.5 px-6">Department / Scope</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {authorizedUsers.map((user) => {
                const badge = getRoleBadge(user.role);
                const Icon = badge.icon;
                const isMasterUser = user.email.toLowerCase() === 'jonesdarko345@gmail.com';

                return (
                  <tr key={user.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs border border-slate-200 dark:border-slate-700">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold border text-[11px] ${badge.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-6">
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{user.department || 'Department of Information Technology'}</p>
                      {user.courseAssigned && (
                        <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">Assigned: {user.courseAssigned}</p>
                      )}
                      {user.level && (
                        <p className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">
                          {user.level} {user.stream ? `· ${user.stream}` : ''}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Authorized</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      {isMasterUser ? (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">Primary HOD</span>
                      ) : isHod ? (
                        <button
                          onClick={() => {
                            if (confirm(`Revoke portal access for ${user.name} (${user.email})?`)) {
                              removeAuthorizedUser(user.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="Revoke access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">Protected</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Authorize New Personnel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Authorize New Personnel</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Grant portal access to Lecturer, HOD, or Class Rep</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 pt-4 text-xs">
              {formError && (
                <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Emmanuel Mensah or Akosua Serwaa"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#007c82] text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Google Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. emmanuel.mensah@uenr.edu.gh or name@gmail.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#007c82] text-xs"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Must match the Google account they use when signing into the portal.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">System Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#007c82] bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold"
                  >
                    <option value="lecturer">Lecturer (Mark Attendance & Reports)</option>
                    <option value="class_rep">Class Representative (In-class assistance)</option>
                    <option value="hod">Head of Department (Full Administrator)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {role === 'class_rep' ? 'Class Level' : role === 'lecturer' ? 'Assigned Course Code' : 'Department'}
                  </label>
                  <input
                    type="text"
                    value={assignedInfo}
                    onChange={(e) => setAssignedInfo(e.target.value)}
                    placeholder={
                      role === 'class_rep'
                        ? 'e.g. Level 100'
                        : role === 'lecturer'
                        ? 'e.g. IT 101, IT 103'
                        : 'Department of IT'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#007c82] text-xs"
                  />
                </div>
              </div>

              {role === 'class_rep' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Class Division / Stream *
                  </label>
                  <select
                    value={assignedStream}
                    onChange={(e) => setAssignedStream(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-teal-50/60 dark:bg-teal-950/40 text-[#007c82] dark:text-teal-300 font-bold focus:outline-none focus:ring-2 focus:ring-[#007c82] text-xs"
                  >
                    <option value="IT A">IT A (Division A)</option>
                    <option value="IT B">IT B (Division B)</option>
                    <option value="IT C">IT C (Division C)</option>
                    <option value="IT D">IT D (Division D)</option>
                    <option value="IT E">IT E (Division E)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#007c82] text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#003b5c] hover:bg-[#004e75] text-white font-bold shadow-md cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Authorize Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
