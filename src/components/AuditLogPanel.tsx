import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AuditLog } from '../types';
import { ShieldCheck, CalendarCheck, Fingerprint, UserPlus, Clock, Search, Filter, Sliders } from 'lucide-react';

export const AuditLogPanel: React.FC = () => {
  const { auditLogs, setAdminSubTab } = useApp();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesSearch =
      searchQuery === '' ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getLogIcon = (type: AuditLog['type']) => {
    switch (type) {
      case 'attendance':
        return <CalendarCheck className="w-4 h-4 text-emerald-600" />;
      case 'biometric':
        return <Fingerprint className="w-4 h-4 text-teal-600" />;
      case 'student':
        return <UserPlus className="w-4 h-4 text-blue-600" />;
      case 'timetable':
        return <Clock className="w-4 h-4 text-amber-600" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-slate-600" />;
    }
  };

  const getBadgeStyle = (type: AuditLog['type']) => {
    switch (type) {
      case 'attendance':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'biometric':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'student':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'timetable':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#007c82] dark:text-teal-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">System Audit Log</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Administrative actions recorded for accountability and university compliance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#007c82]"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#007c82]"
            >
              <option value="all">All Events</option>
              <option value="attendance">Attendance</option>
              <option value="biometric">Biometrics</option>
              <option value="student">Students</option>
              <option value="timetable">Timetable</option>
            </select>

            <button
              type="button"
              onClick={() => setAdminSubTab('autologging')}
              className="px-3 py-1.5 text-xs font-bold bg-[#007c82]/10 hover:bg-[#007c82]/20 text-[#007c82] dark:text-teal-300 border border-[#007c82]/20 dark:border-teal-700/40 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
              title="Configure Automated Audit Logging Policies"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
            No audit logs found matching your criteria.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 mt-0.5">
                {getLogIcon(log.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">{log.action}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getBadgeStyle(
                      log.type
                    )}`}
                  >
                    {log.type}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">by {log.user}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{log.details}</p>
              </div>

              <div className="text-[11px] text-slate-400 dark:text-slate-500 flex-shrink-0">
                {new Date(log.timestamp).toLocaleString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
