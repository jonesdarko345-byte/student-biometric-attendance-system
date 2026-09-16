import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sliders,
  ShieldCheck,
  Fingerprint,
  Clock,
  CalendarCheck,
  FileSpreadsheet,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Lock,
  CloudCheck
} from 'lucide-react';
import { AutoLoggingSettings } from '../types';

export const AutoLoggingSettingsPanel: React.FC = () => {
  const {
    autoLoggingSettings,
    updateAutoLoggingSettings,
    isAutoSignIn,
    toggleAutoSignIn,
    currentUser,
    addAuditLog
  } = useApp();

  const [formState, setFormState] = useState<AutoLoggingSettings>(autoLoggingSettings);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Sync state if external changes arrive
  React.useEffect(() => {
    setFormState(autoLoggingSettings);
  }, [autoLoggingSettings]);

  const handleToggle = (key: keyof AutoLoggingSettings) => {
    setFormState((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleNumberChange = (key: keyof AutoLoggingSettings, value: number) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateAutoLoggingSettings(formState);
      await addAuditLog(
        'Auto-Logging Settings Updated',
        `Configured automated attendance policies & security logging retention (${formState.logRetentionDays === 0 ? 'Indefinite' : `${formState.logRetentionDays} days`})`,
        'timetable'
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    const defaults: AutoLoggingSettings = {
      autoLogBiometricScanSuccess: true,
      autoLogBiometricScanFailure: true,
      autoLogSessionDrafts: true,
      autoLogFinalizedSessions: true,
      autoFinalizeOnClassEnd: false,
      autoFinalizeGracePeriodMinutes: 15,
      autoMarkAbsentOnFinalize: true,
      autoFlagLateArrivals: true,
      lateThresholdMinutes: 15,
      autoAlertAttendanceDeficit: true,
      autoLogAuthLogins: true,
      autoLogRoleChanges: true,
      autoLogRosterModifications: true,
      autoLogTimetableChanges: true,
      autoLogReportExports: true,
      autoLogOfflineSync: true,
      logRetentionDays: 90,
      autoPruneOldLogs: false,
      realtimeCloudSync: true
    };
    setFormState(defaults);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#007c82] dark:text-teal-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
              Auto-Logging & Policy Automation
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure automated roll-call events, biometric audit recording, session finalization, and data retention policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-xl bg-[#003b5c] hover:bg-[#004e75] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Saved to Cloud!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8 divide-y divide-slate-100 dark:divide-slate-800/80">
        {/* Section 0: Device Authentication & Auto Sign-In */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Device Authentication & Auto Sign-In
            </h4>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-amber-950 dark:text-amber-200">
                  Instant Device Auto-Sign In
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isAutoSignIn
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  {isAutoSignIn ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300/80 leading-relaxed">
                When enabled, the app automatically activates your verified HOD/Lecturer profile without prompting for Gmail account selection on app start or page refresh.
              </p>
            </div>

            <button
              type="button"
              onClick={() => toggleAutoSignIn()}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
                isAutoSignIn
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
              }`}
            >
              {isAutoSignIn ? 'Auto Sign-In Enabled' : 'Enable Auto Sign-In'}
            </button>
          </div>
        </div>

        {/* Section 1: Biometric & Scanning Automation */}
        <div className="pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Biometric Scan & Roll-Call Logging
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={formState.autoLogBiometricScanSuccess}
                onChange={() => handleToggle('autoLogBiometricScanSuccess')}
                className="w-4 h-4 mt-0.5 text-teal-600 rounded focus:ring-teal-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Log Successful Biometric Verifications
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Write an audit trail record whenever a student fingerprint is matched successfully.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={formState.autoLogBiometricScanFailure}
                onChange={() => handleToggle('autoLogBiometricScanFailure')}
                className="w-4 h-4 mt-0.5 text-teal-600 rounded focus:ring-teal-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Log Unrecognized / Failed Biometric Scans
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Flag security entries when an un-enrolled finger attempts attendance marking.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={formState.autoLogSessionDrafts}
                onChange={() => handleToggle('autoLogSessionDrafts')}
                className="w-4 h-4 mt-0.5 text-teal-600 rounded focus:ring-teal-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Log Draft Attendance Saves
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Record intermediate roll-call updates before final submission.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={formState.autoLogFinalizedSessions}
                onChange={() => handleToggle('autoLogFinalizedSessions')}
                className="w-4 h-4 mt-0.5 text-teal-600 rounded focus:ring-teal-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Log Finalized Sessions
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Record permanent audit entries when attendance sheets are locked and finalized.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Section 2: Session & Timetable Automation */}
        <div className="pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Lecture Session Automation & Rules
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={formState.autoMarkAbsentOnFinalize}
                onChange={() => handleToggle('autoMarkAbsentOnFinalize')}
                className="w-4 h-4 mt-0.5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Auto-Mark Unverified as Absent
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Students without verified biometric check-ins will automatically default to Absent.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={formState.autoAlertAttendanceDeficit}
                onChange={() => handleToggle('autoAlertAttendanceDeficit')}
                className="w-4 h-4 mt-0.5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Auto-Alert Deficit (&lt; 75% Attendance)
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Highlight students in danger of exam disqualification per UENR academic statutes.
                </span>
              </div>
            </label>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                Late Arrival Flagging Window
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                Students checking in after this buffer will be flagged as &quot;Late Arrival&quot;.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="5"
                max="45"
                step="5"
                value={formState.lateThresholdMinutes}
                onChange={(e) => handleNumberChange('lateThresholdMinutes', Number(e.target.value))}
                className="w-28 accent-[#007c82]"
              />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-16 text-right">
                {formState.lateThresholdMinutes} mins
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Administrative & Security Logging */}
        <div className="pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Administrative & Security Audit Events
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={formState.autoLogAuthLogins}
                onChange={() => handleToggle('autoLogAuthLogins')}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="font-medium text-slate-800 dark:text-slate-200">Log Sign-ins & Exits</span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={formState.autoLogRoleChanges}
                onChange={() => handleToggle('autoLogRoleChanges')}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="font-medium text-slate-800 dark:text-slate-200">Log Access Whitelisting</span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={formState.autoLogRosterModifications}
                onChange={() => handleToggle('autoLogRosterModifications')}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="font-medium text-slate-800 dark:text-slate-200">Log Student Enrollments</span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={formState.autoLogTimetableChanges}
                onChange={() => handleToggle('autoLogTimetableChanges')}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="font-medium text-slate-800 dark:text-slate-200">Log Schedule Adjustments</span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={formState.autoLogReportExports}
                onChange={() => handleToggle('autoLogReportExports')}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="font-medium text-slate-800 dark:text-slate-200">Log Report Exports</span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={formState.autoLogOfflineSync}
                onChange={() => handleToggle('autoLogOfflineSync')}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="font-medium text-slate-800 dark:text-slate-200">Log Offline Syncs</span>
            </label>
          </div>
        </div>

        {/* Section 4: Log Retention & Archival Policies */}
        <div className="pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Log Retention & Archival Policy
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Audit Log Retention Window
              </label>
              <select
                value={formState.logRetentionDays}
                onChange={(e) => handleNumberChange('logRetentionDays', Number(e.target.value))}
                className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-teal-600"
              >
                <option value={30}>30 Days (Active Semester Month)</option>
                <option value={60}>60 Days (Mid-Term Cycle)</option>
                <option value={90}>90 Days (Full Semester Standard)</option>
                <option value={180}>180 Days (Full Academic Year)</option>
                <option value={365}>365 Days (1 Full Year)</option>
                <option value={0}>Indefinite (Never Prune Records)</option>
              </select>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Retention duration for biometric roll calls and authorization entries.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Cloud Synchronization Mode
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formState.realtimeCloudSync}
                  onChange={() => handleToggle('realtimeCloudSync')}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="font-semibold">Real-Time Firestore Sync</span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Synchronize audit and settings changes instantaneously across all faculty devices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
