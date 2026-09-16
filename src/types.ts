export const DEFAULT_STREAMS = ['IT A', 'IT B', 'IT C', 'IT D', 'IT E'] as const;
export type ClassStream = typeof DEFAULT_STREAMS[number] | string;

export interface Student {
  id: string;
  name: string;
  indexNumber: string; // e.g. UEB3100122
  email: string;
  program: string; // e.g. BSc Information Technology
  level: string; // e.g. Level 100, Level 200, Level 300, Level 400
  stream?: string; // e.g. "IT A", "IT B", "IT C", "IT D", "IT E"
  enrolledFingers: string[]; // e.g. ["Right Thumb", "Right Index"]
  createdAt: string;
}

export interface Course {
  id: string;
  code: string; // e.g. IT 301
  title: string; // e.g. Web Technologies & Systems
  creditHours: number;
  lecturer: string;
  department: string;
}

export interface TimetableSlot {
  id: string;
  courseId: string;
  dayOfWeek: number; // 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday
  startTime: string; // e.g. "08:00"
  endTime: string; // e.g. "10:00"
  venue: string; // e.g. "LT 2 - Sunyani Campus"
  stream?: string; // e.g. "IT A", "IT B", "IT C", "IT D", "IT E", or undefined for all streams
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  courseId: string;
  timetableSlotId?: string;
  stream?: string; // Scoped class stream e.g. "IT A"
  isFinalized: boolean;
  finalizedAt?: string;
  records: Record<string, 'present' | 'absent'>; // studentId -> status
  biometricVerifiedStudentIds: string[];
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  user: string;
  type: 'attendance' | 'biometric' | 'student' | 'timetable' | 'security' | 'system';
}

export interface AutoLoggingSettings {
  // Biometric & Attendance Scanning Automation
  autoLogBiometricScanSuccess: boolean;
  autoLogBiometricScanFailure: boolean;
  autoLogSessionDrafts: boolean;
  autoLogFinalizedSessions: boolean;
  
  // Lecture Session Automation
  autoFinalizeOnClassEnd: boolean;
  autoFinalizeGracePeriodMinutes: number;
  autoMarkAbsentOnFinalize: boolean;
  autoFlagLateArrivals: boolean;
  lateThresholdMinutes: number;
  autoAlertAttendanceDeficit: boolean;

  // Security & Administrative Logging
  autoLogAuthLogins: boolean;
  autoLogRoleChanges: boolean;
  autoLogRosterModifications: boolean;
  autoLogTimetableChanges: boolean;
  autoLogReportExports: boolean;
  autoLogOfflineSync: boolean;

  // Retention & Archival
  logRetentionDays: number; // 0 for indefinite, or 30, 60, 90, 180, 365
  autoPruneOldLogs: boolean;
  realtimeCloudSync: boolean;
}

export type UserRole = 'hod' | 'lecturer' | 'class_rep';

export interface AuthorizedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  courseAssigned?: string;
  level?: string;
  stream?: string; // e.g. "IT A" if class rep is scoped to specific division
  addedAt?: string;
}

export interface CurrentUser {
  name: string;
  email?: string;
  role: UserRole;
  department: string;
  stream?: string;
  photoURL?: string;
  uid?: string;
}

export interface SemesterConfig {
  name: string;
  academicYear: string;
  semester: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}
