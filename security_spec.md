# Security Specification & Threat Model

## 1. Data Invariants

- **Student Integrity**: Every student document must have an index number, name, program, level, and a valid string ID. Only authenticated lecturers and administrators can register, update, or remove students.
- **Attendance Accountability**: An attendance record must reference an existing course, hold valid dates in YYYY-MM-DD format, and validate student status as either `'present'` or `'absent'`.
- **Session Locking (Terminal State Protection)**: When `isFinalized == true`, only authorized administrators can alter or unlock the session.
- **Course & Timetable Schedules**: Only authenticated academic staff can schedule weekly timetable slots or create courses.
- **User Identity & Admin Access**: Users can only write their own user profile document (`users/$(request.auth.uid)`). The bootstrapped administrator email (`jonesdarko345@gmail.com`) is granted administrative rights.
- **Audit Immutability**: Audit logs once created cannot be updated or deleted by normal users to preserve evidentiary integrity.

---

## 2. The "Dirty Dozen" Threat Payloads

1. **Unauthenticated Student Injection**: An unauthenticated user attempts to create a student in `/students/hacker1`. (Expect: `PERMISSION_DENIED`)
2. **Invalid Student ID Character**: Creating `/students/bad*id#` with invalid characters in document ID. (Expect: `PERMISSION_DENIED`)
3. **Student Oversized String Denial of Wallet**: Student name payload with > 10,000 characters. (Expect: `PERMISSION_DENIED`)
4. **Attendance Ghost Field Injection**: Writing an attendance record with unauthorized fields like `{ evilAdminPrivilege: true }`. (Expect: `PERMISSION_DENIED`)
5. **Direct Attendance Tampering on Finalized Session**: Non-admin attempting to modify records in a locked attendance document where `isFinalized == true`. (Expect: `PERMISSION_DENIED`)
6. **Student Self-Enrollment of Biometrics**: An unauthenticated user attempting to enroll or overwrite `enrolledFingers`. (Expect: `PERMISSION_DENIED`)
7. **Cross-User Profile Hijacking**: User A (`uid_1`) attempting to update `/users/uid_2`. (Expect: `PERMISSION_DENIED`)
8. **Admin Privilege Escalation in Profile**: A normal user attempting to set `role: "admin"` in their own profile document without administrative rights. (Expect: `PERMISSION_DENIED`)
9. **Audit Log Deletion Attempt**: Any user attempting to delete from `/auditLogs/{logId}`. (Expect: `PERMISSION_DENIED`)
10. **Audit Log Tampering (Update)**: Any user attempting to modify historical entries in `/auditLogs/{logId}`. (Expect: `PERMISSION_DENIED`)
11. **Timetable Slot Weekend Tampering**: Attempting to schedule on invalid days (outside Monday-Friday). (Expect: `PERMISSION_DENIED`)
12. **Blanket Query Scraping**: Unauthenticated client querying the entire `/users` collection. (Expect: `PERMISSION_DENIED`)
