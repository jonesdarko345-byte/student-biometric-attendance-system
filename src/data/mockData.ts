import { Student, Course, TimetableSlot, AttendanceRecord, AuditLog, SemesterConfig, AuthorizedUser } from '../types';

// The student roster starts completely empty so the user can add their real class students
export const INITIAL_STUDENTS: Student[] = [];

// Courses and timetable start completely empty so the user can assign their own courses and study days
export const INITIAL_COURSES: Course[] = [];

export const INITIAL_TIMETABLE: TimetableSlot[] = [];

// Attendance starts empty as no students are initially registered
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

// Whitelist of authorized staff and class reps
export const INITIAL_AUTHORIZED_USERS: AuthorizedUser[] = [
  {
    id: 'auth-1',
    email: 'jonesdarko345@gmail.com',
    name: 'Dr. Jones Darko',
    role: 'hod',
    department: 'Department of Information Technology',
    addedAt: '2025-01-10'
  },
  {
    id: 'auth-2',
    email: 'dr.asante@uenr.edu.gh',
    name: 'Dr. Kwabena Asante',
    role: 'lecturer',
    department: 'Department of Information Technology',
    courseAssigned: 'IT 301',
    addedAt: '2025-01-12'
  },
  {
    id: 'auth-3',
    email: 'classrep.it300@uenr.edu.gh',
    name: 'Kofi Mensah (Class Rep)',
    role: 'class_rep',
    department: 'Department of Information Technology',
    level: 'Level 300',
    addedAt: '2025-01-15'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    action: 'System Initialized',
    details: 'UENR IT Dept Biometric Attendance portal initialized. Access restricted to HODs, Lecturers, and Class Reps.',
    timestamp: new Date().toISOString(),
    user: 'System',
    type: 'timetable'
  }
];

export const INITIAL_SEMESTER: SemesterConfig = {
  name: 'Second Semester 2024/2025',
  academicYear: '2024/2025',
  semester: 'Semester 2',
  startDate: '2025-01-20',
  endDate: '2025-06-15',
  isActive: true
};
