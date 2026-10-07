import {
  Department,
  Subject,
  Faculty,
  Student,
  CollegeClass,
  Enrollment,
  AttendanceSession,
  AttendanceRecord,
  CorrectionRequest,
  Announcement,
  User,
} from '../types';
import { generateDeterministicBiometricDescriptor } from '../utils/faceRecognitionEngine';

export const initialDepartments: Department[] = [
  { id: 'dept-ce', name: 'Computer Engineering', code: 'CE' },
  { id: 'dept-it', name: 'Information Technology', code: 'IT' },
  { id: 'dept-aids', name: 'AI & Data Science', code: 'AIDS' },
  { id: 'dept-ece', name: 'Electronics & Communication', code: 'ECE' },
];

export const initialSubjects: Subject[] = [
  // Semester 3 Subjects (CE / IT)
  { id: 'sub-dbms', name: 'Database Management Systems', code: 'CS301', credits: 4, department_id: 'dept-ce' },
  { id: 'sub-os', name: 'Operating Systems', code: 'CS302', credits: 4, department_id: 'dept-ce' },
  { id: 'sub-maths', name: 'Applied Mathematics III', code: 'MA301', credits: 3, department_id: 'dept-ce' },
  { id: 'sub-py', name: 'Advanced Python & OOP', code: 'CS304', credits: 3, department_id: 'dept-ce' },
  { id: 'sub-toc', name: 'Theory of Computation', code: 'CS305', credits: 3, department_id: 'dept-ce' },
  { id: 'sub-se', name: 'Software Engineering & Agile', code: 'CS306', credits: 3, department_id: 'dept-ce' },

  // Semester 5 Subjects (CE / IT / AIDS)
  { id: 'sub-cn', name: 'Computer Networks & Security', code: 'CS501', credits: 4, department_id: 'dept-it' },
  { id: 'sub-cloud', name: 'Cloud Computing & DevOps', code: 'CS502', credits: 3, department_id: 'dept-it' },
  { id: 'sub-ml', name: 'Machine Learning & NLP', code: 'AI503', credits: 4, department_id: 'dept-aids' },
  { id: 'sub-ca', name: 'Computer Architecture & Systems', code: 'CS504', credits: 3, department_id: 'dept-ce' },
];

export const initialFaculty: Faculty[] = [
  { id: 'fac-1', user_id: 'usr-fac-1', name: 'Prof. Rajesh Sharma', email: 'sharma.cs@college.edu', department_id: 'dept-ce', employee_id: 'EMP-101', designation: 'Associate Professor' },
  { id: 'fac-2', user_id: 'usr-fac-2', name: 'Dr. Anita Rao', email: 'rao.cs@college.edu', department_id: 'dept-ce', employee_id: 'EMP-102', designation: 'Professor & HOD' },
  { id: 'fac-3', user_id: 'usr-fac-3', name: 'Prof. Vikram Patel', email: 'patel.math@college.edu', department_id: 'dept-ce', employee_id: 'EMP-103', designation: 'Assistant Professor' },
  { id: 'fac-4', user_id: 'usr-fac-4', name: 'Prof. Neha Verma', email: 'verma.ai@college.edu', department_id: 'dept-aids', employee_id: 'EMP-104', designation: 'Assistant Professor' },
  { id: 'fac-5', user_id: 'usr-fac-5', name: 'Dr. Sanjay Deshmukh', email: 'deshmukh.it@college.edu', department_id: 'dept-it', employee_id: 'EMP-105', designation: 'Professor' },
  { id: 'fac-6', user_id: 'usr-fac-6', name: 'Prof. Meera Nair', email: 'nair.ce@college.edu', department_id: 'dept-ce', employee_id: 'EMP-106', designation: 'Associate Professor' },
  { id: 'fac-7', user_id: 'usr-fac-7', name: 'Prof. Arjun Kulkarni', email: 'kulkarni.it@college.edu', department_id: 'dept-it', employee_id: 'EMP-107', designation: 'Assistant Professor' },
  { id: 'fac-8', user_id: 'usr-fac-8', name: 'Dr. Sunita Bhatt', email: 'bhatt.ce@college.edu', department_id: 'dept-ce', employee_id: 'EMP-108', designation: 'Professor' },
];

const rawStudents: Student[] = [
  // ── SEMESTER 3 · DIVISION A (CE) ───────────────────────────
  { id: 'stu-1', user_id: 'usr-stu-1', name: 'Aarav Patel', email: 'aarav.p@student.college.edu', roll_number: '01', enrollment_number: 'EN202401', department_id: 'dept-ce', semester: 3, division: 'A', face_registered: true, avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' },
  { id: 'stu-2', user_id: 'usr-stu-2', name: 'Priya Sharma', email: 'priya.s@student.college.edu', roll_number: '02', enrollment_number: 'EN202402', department_id: 'dept-ce', semester: 3, division: 'A', face_registered: true, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { id: 'stu-3', user_id: 'usr-stu-3', name: 'Rohan Kulkarni', email: 'rohan.k@student.college.edu', roll_number: '03', enrollment_number: 'EN202403', department_id: 'dept-ce', semester: 3, division: 'A', face_registered: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: 'stu-4', user_id: 'usr-stu-4', name: 'Sneha Gupta', email: 'sneha.g@student.college.edu', roll_number: '04', enrollment_number: 'EN202404', department_id: 'dept-ce', semester: 3, division: 'A', face_registered: true, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
  { id: 'stu-5', user_id: 'usr-stu-5', name: 'Ananya Roy', email: 'ananya.r@student.college.edu', roll_number: '05', enrollment_number: 'EN202405', department_id: 'dept-ce', semester: 3, division: 'A', face_registered: true, avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80' },
  { id: 'stu-6', user_id: 'usr-stu-6', name: 'Kabir Mehta', email: 'kabir.m@student.college.edu', roll_number: '06', enrollment_number: 'EN202406', department_id: 'dept-ce', semester: 3, division: 'A', face_registered: true, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { id: 'stu-7', user_id: 'usr-stu-7', name: 'Ishaan Joshi', email: 'ishaan.j@student.college.edu', roll_number: '07', enrollment_number: 'EN202407', department_id: 'dept-ce', semester: 3, division: 'A', face_registered: true, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' },
  { id: 'stu-8', user_id: 'usr-stu-8', name: 'Diya Nair', email: 'diya.n@student.college.edu', roll_number: '08', enrollment_number: 'EN202408', department_id: 'dept-ce', semester: 3, division: 'A', face_registered: true, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { id: 'stu-9', user_id: 'usr-stu-9', name: 'Vivaan Desai', email: 'vivaan.d@student.college.edu', roll_number: '09', enrollment_number: 'EN202409', department_id: 'dept-ce', semester: 3, division: 'A', face_registered: true, avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80' },
  { id: 'stu-10', user_id: 'usr-stu-10', name: 'Riya Sen', email: 'riya.s@student.college.edu', roll_number: '10', enrollment_number: 'EN202410', department_id: 'dept-ce', semester: 3, division: 'A', face_registered: true, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
  { id: 'stu-11', user_id: 'usr-stu-11', name: 'Arjun Khanna', email: 'arjun.k@student.college.edu', roll_number: '11', enrollment_number: 'EN202411', department_id: 'dept-ce', semester: 3, division: 'A', face_registered: true },
  { id: 'stu-12', user_id: 'usr-stu-12', name: 'Kavya Pillai', email: 'kavya.p@student.college.edu', roll_number: '12', enrollment_number: 'EN202412', department_id: 'dept-ce', semester: 3, division: 'A', face_registered: true },
  { id: 'stu-13', user_id: 'usr-stu-13', name: 'Siddharth Rao', email: 'siddharth.r@student.college.edu', roll_number: '13', enrollment_number: 'EN202413', department_id: 'dept-ce', semester: 3, division: 'A', face_registered: true },
  { id: 'stu-14', user_id: 'usr-stu-14', name: 'Aditya Verma', email: 'aditya.v@student.college.edu', roll_number: '14', enrollment_number: 'EN202414', department_id: 'dept-ce', semester: 3, division: 'A', face_registered: true },
  { id: 'stu-15', user_id: 'usr-stu-15', name: 'Tara Mukherjee', email: 'tara.m@student.college.edu', roll_number: '15', enrollment_number: 'EN202415', department_id: 'dept-ce', semester: 3, division: 'A', face_registered: true },
  { id: 'stu-16', user_id: 'usr-stu-16', name: 'Devansh Hegde', email: 'devansh.h@student.college.edu', roll_number: '16', enrollment_number: 'EN202416', department_id: 'dept-ce', semester: 3, division: 'A', face_registered: true },
  { id: 'stu-17', user_id: 'usr-stu-17', name: 'Meera Chawla', email: 'meera.c@student.college.edu', roll_number: '17', enrollment_number: 'EN202417', department_id: 'dept-ce', semester: 3, division: 'A', face_registered: true },
  { id: 'stu-18', user_id: 'usr-stu-18', name: 'Kunal Singhal', email: 'kunal.s@student.college.edu', roll_number: '18', enrollment_number: 'EN202418', department_id: 'dept-ce', semester: 3, division: 'A', face_registered: true },
  { id: 'stu-19', user_id: 'usr-stu-19', name: 'Anika Bansal', email: 'anika.b@student.college.edu', roll_number: '19', enrollment_number: 'EN202419', department_id: 'dept-ce', semester: 3, division: 'A', face_registered: true },
  { id: 'stu-20', user_id: 'usr-stu-20', name: 'Aryan Kapoor', email: 'aryan.k@student.college.edu', roll_number: '20', enrollment_number: 'EN202420', department_id: 'dept-ce', semester: 3, division: 'A', face_registered: true },
  { id: 'stu-21', user_id: 'usr-stu-21', name: 'Pranav Saxena', email: 'pranav.s@student.college.edu', roll_number: '21', enrollment_number: 'EN202421', department_id: 'dept-ce', semester: 3, division: 'A', face_registered: true },
  { id: 'stu-22', user_id: 'usr-stu-22', name: 'Nisha Bhatia', email: 'nisha.b@student.college.edu', roll_number: '22', enrollment_number: 'EN202422', department_id: 'dept-ce', semester: 3, division: 'A', face_registered: true },
  { id: 'stu-23', user_id: 'usr-stu-23', name: 'Yash Vardhan', email: 'yash.v@student.college.edu', roll_number: '23', enrollment_number: 'EN202423', department_id: 'dept-ce', semester: 3, division: 'A', face_registered: true },
  { id: 'stu-24', user_id: 'usr-stu-24', name: 'Simran Kaur', email: 'simran.k@student.college.edu', roll_number: '24', enrollment_number: 'EN202424', department_id: 'dept-ce', semester: 3, division: 'A', face_registered: true },
  { id: 'stu-25', user_id: 'usr-stu-25', name: 'Tanvi Iyer', email: 'tanvi.i@student.college.edu', roll_number: '25', enrollment_number: 'EN202425', department_id: 'dept-ce', semester: 3, division: 'A', face_registered: true },

  // ── SEMESTER 3 · DIVISION B (CE / IT) ──────────────────────
  { id: 'stu-26', user_id: 'usr-stu-26', name: 'Varun Reddy', email: 'varun.r@student.college.edu', roll_number: '01', enrollment_number: 'EN202431', department_id: 'dept-ce', semester: 3, division: 'B', face_registered: true },
  { id: 'stu-27', user_id: 'usr-stu-27', name: 'Bhavna Menon', email: 'bhavna.m@student.college.edu', roll_number: '02', enrollment_number: 'EN202432', department_id: 'dept-ce', semester: 3, division: 'B', face_registered: true },
  { id: 'stu-28', user_id: 'usr-stu-28', name: 'Chirag Sethi', email: 'chirag.s@student.college.edu', roll_number: '03', enrollment_number: 'EN202433', department_id: 'dept-ce', semester: 3, division: 'B', face_registered: true },
  { id: 'stu-29', user_id: 'usr-stu-29', name: 'Deepa Nambiar', email: 'deepa.n@student.college.edu', roll_number: '04', enrollment_number: 'EN202434', department_id: 'dept-ce', semester: 3, division: 'B', face_registered: true },
  { id: 'stu-30', user_id: 'usr-stu-30', name: 'Eeshan Mathur', email: 'eeshan.m@student.college.edu', roll_number: '05', enrollment_number: 'EN202435', department_id: 'dept-ce', semester: 3, division: 'B', face_registered: true },
  { id: 'stu-31', user_id: 'usr-stu-31', name: 'Falguni Pathak', email: 'falguni.p@student.college.edu', roll_number: '06', enrollment_number: 'EN202436', department_id: 'dept-ce', semester: 3, division: 'B', face_registered: true },
  { id: 'stu-32', user_id: 'usr-stu-32', name: 'Gaurav Tiwari', email: 'gaurav.t@student.college.edu', roll_number: '07', enrollment_number: 'EN202437', department_id: 'dept-ce', semester: 3, division: 'B', face_registered: true },
  { id: 'stu-33', user_id: 'usr-stu-33', name: 'Harshita Bajaj', email: 'harshita.b@student.college.edu', roll_number: '08', enrollment_number: 'EN202438', department_id: 'dept-ce', semester: 3, division: 'B', face_registered: true },
  { id: 'stu-34', user_id: 'usr-stu-34', name: 'Indrajit Paul', email: 'indrajit.p@student.college.edu', roll_number: '09', enrollment_number: 'EN202439', department_id: 'dept-ce', semester: 3, division: 'B', face_registered: true },
  { id: 'stu-35', user_id: 'usr-stu-35', name: 'Jhanvi Trivedi', email: 'jhanvi.t@student.college.edu', roll_number: '10', enrollment_number: 'EN202440', department_id: 'dept-ce', semester: 3, division: 'B', face_registered: true },

  // ── SEMESTER 5 · DIVISION A (IT / AIDS / CE) ───────────────
  { id: 'stu-36', user_id: 'usr-stu-36', name: 'Dhruv Malhotra', email: 'dhruv.m@student.college.edu', roll_number: '01', enrollment_number: 'EN202301', department_id: 'dept-it', semester: 5, division: 'A', face_registered: true },
  { id: 'stu-37', user_id: 'usr-stu-37', name: 'Rupali Deshmukh', email: 'rupali.d@student.college.edu', roll_number: '02', enrollment_number: 'EN202302', department_id: 'dept-it', semester: 5, division: 'A', face_registered: true },
  { id: 'stu-38', user_id: 'usr-stu-38', name: 'Soham Chatterjee', email: 'soham.c@student.college.edu', roll_number: '03', enrollment_number: 'EN202303', department_id: 'dept-aids', semester: 5, division: 'A', face_registered: true },
  { id: 'stu-39', user_id: 'usr-stu-39', name: 'Trisha Somani', email: 'trisha.s@student.college.edu', roll_number: '04', enrollment_number: 'EN202304', department_id: 'dept-aids', semester: 5, division: 'A', face_registered: true },
  { id: 'stu-40', user_id: 'usr-stu-40', name: 'Utkarsh Aggarwal', email: 'utkarsh.a@student.college.edu', roll_number: '05', enrollment_number: 'EN202305', department_id: 'dept-ce', semester: 5, division: 'A', face_registered: true },
  { id: 'stu-41', user_id: 'usr-stu-41', name: 'Vaishnavi Rane', email: 'vaishnavi.r@student.college.edu', roll_number: '06', enrollment_number: 'EN202306', department_id: 'dept-ce', semester: 5, division: 'A', face_registered: true },
  { id: 'stu-42', user_id: 'usr-stu-42', name: 'Waseem Akram', email: 'waseem.a@student.college.edu', roll_number: '07', enrollment_number: 'EN202307', department_id: 'dept-it', semester: 5, division: 'A', face_registered: true },
];

export const initialStudents: Student[] = rawStudents.map((s) => ({
  ...s,
  face_profile: s.face_profile || (s.face_registered ? {
    student_id: s.id,
    enrolled_at: '2025-01-15T09:00:00Z',
    photo_url: s.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    descriptor: generateDeterministicBiometricDescriptor(s.id),
  } : undefined),
}));

export const initialUsers: User[] = [
  // Admin
  { id: 'usr-admin', name: 'Dr. S. K. Kulkarni', email: 'dean.academics@college.edu', role: 'ADMIN', created_at: '2025-01-01' },

  // Faculty Users
  ...initialFaculty.map((f) => ({
    id: f.user_id,
    name: f.name,
    email: f.email,
    role: 'FACULTY' as const,
    created_at: '2025-01-01',
  })),

  // Student Users
  ...initialStudents.map((s) => ({
    id: s.user_id,
    name: s.name,
    email: s.email,
    role: 'STUDENT' as const,
    created_at: '2025-08-01',
  })),
];

export const initialClasses: CollegeClass[] = [
  // ── SEMESTER 3 · DIVISION A ────────────────────────────────
  { id: 'cls-dbms-3a', subject_id: 'sub-dbms', faculty_id: 'fac-1', semester: 3, division: 'A', room: 'Room 402', schedule_time: '10:00 AM - 11:00 AM', day_of_week: 'Monday' },
  { id: 'cls-os-3a', subject_id: 'sub-os', faculty_id: 'fac-2', semester: 3, division: 'A', room: 'Room 405', schedule_time: '11:15 AM - 12:15 PM', day_of_week: 'Tuesday' },
  { id: 'cls-maths-3a', subject_id: 'sub-maths', faculty_id: 'fac-3', semester: 3, division: 'A', room: 'Room 301', schedule_time: '01:00 PM - 02:00 PM', day_of_week: 'Wednesday' },
  { id: 'cls-py-3a', subject_id: 'sub-py', faculty_id: 'fac-4', semester: 3, division: 'A', room: 'Lab 2', schedule_time: '02:15 PM - 03:15 PM', day_of_week: 'Thursday' },
  { id: 'cls-toc-3a', subject_id: 'sub-toc', faculty_id: 'fac-1', semester: 3, division: 'A', room: 'Room 402', schedule_time: '03:30 PM - 04:30 PM', day_of_week: 'Friday' },
  { id: 'cls-se-3a', subject_id: 'sub-se', faculty_id: 'fac-6', semester: 3, division: 'A', room: 'Room 401', schedule_time: '09:00 AM - 10:00 AM', day_of_week: 'Monday' },

  // ── SEMESTER 3 · DIVISION B ────────────────────────────────
  { id: 'cls-dbms-3b', subject_id: 'sub-dbms', faculty_id: 'fac-1', semester: 3, division: 'B', room: 'Room 403', schedule_time: '11:15 AM - 12:15 PM', day_of_week: 'Monday' },
  { id: 'cls-os-3b', subject_id: 'sub-os', faculty_id: 'fac-2', semester: 3, division: 'B', room: 'Room 406', schedule_time: '02:15 PM - 03:15 PM', day_of_week: 'Tuesday' },
  { id: 'cls-maths-3b', subject_id: 'sub-maths', faculty_id: 'fac-3', semester: 3, division: 'B', room: 'Room 302', schedule_time: '10:00 AM - 11:00 AM', day_of_week: 'Wednesday' },
  { id: 'cls-py-3b', subject_id: 'sub-py', faculty_id: 'fac-4', semester: 3, division: 'B', room: 'Lab 1', schedule_time: '03:30 PM - 04:30 PM', day_of_week: 'Thursday' },

  // ── SEMESTER 5 · DIVISION A ────────────────────────────────
  { id: 'cls-cn-5a', subject_id: 'sub-cn', faculty_id: 'fac-5', semester: 5, division: 'A', room: 'Room 501', schedule_time: '10:00 AM - 11:00 AM', day_of_week: 'Tuesday' },
  { id: 'cls-cloud-5a', subject_id: 'sub-cloud', faculty_id: 'fac-7', semester: 5, division: 'A', room: 'Lab 3', schedule_time: '11:15 AM - 12:15 PM', day_of_week: 'Wednesday' },
  { id: 'cls-ml-5a', subject_id: 'sub-ml', faculty_id: 'fac-4', semester: 5, division: 'A', room: 'AI Centre', schedule_time: '01:00 PM - 02:00 PM', day_of_week: 'Thursday' },
  { id: 'cls-ca-5a', subject_id: 'sub-ca', faculty_id: 'fac-8', semester: 5, division: 'A', room: 'Room 502', schedule_time: '02:15 PM - 03:15 PM', day_of_week: 'Friday' },
];

export const initialEnrollments: Enrollment[] = initialStudents.flatMap((stu) => {
  const matchingClasses = initialClasses.filter(
    (c) => c.semester === stu.semester && c.division === stu.division
  );
  return matchingClasses.map((cls) => ({
    id: `enr-${stu.id}-${cls.id}`,
    student_id: stu.id,
    class_id: cls.id,
  }));
});

export const initialSessions: AttendanceSession[] = [
  {
    id: 'sess-active-1',
    class_id: 'cls-dbms-3a',
    faculty_id: 'fac-1',
    start_time: new Date(Date.now() - 10 * 60000).toISOString(),
    status: 'ACTIVE',
    qr_token: 'AP-LIVE-98214',
    token_generated_at: Date.now() - 15000,
    expires_at: Date.now() + 15000,
    token_refresh_interval_sec: 30,
  },
  {
    id: 'sess-past-1',
    class_id: 'cls-dbms-3a',
    faculty_id: 'fac-1',
    start_time: '2026-09-15T10:00:00',
    end_time: '2026-09-15T11:00:00',
    status: 'CLOSED',
    qr_token: 'AP-PAST-01',
    token_generated_at: Date.now() - 86400000,
    expires_at: Date.now() - 86400000 + 30000,
    token_refresh_interval_sec: 30,
  },
];

// Helper to seed realistic records across all classes and enrolled students
export function generateSeedAttendanceRecords(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];

  // Lecture counts per class in the semester
  const classDistributions = [
    // Sem 3 Div A
    { classId: 'cls-dbms-3a', total: 14, aaravPresent: 12 },
    { classId: 'cls-os-3a', total: 12, aaravPresent: 10 },
    { classId: 'cls-maths-3a', total: 10, aaravPresent: 8 },
    { classId: 'cls-py-3a', total: 8, aaravPresent: 7 },
    { classId: 'cls-toc-3a', total: 6, aaravPresent: 5 },
    { classId: 'cls-se-3a', total: 6, aaravPresent: 6 },

    // Sem 3 Div B
    { classId: 'cls-dbms-3b', total: 12, aaravPresent: 0 },
    { classId: 'cls-os-3b', total: 10, aaravPresent: 0 },
    { classId: 'cls-maths-3b', total: 8, aaravPresent: 0 },
    { classId: 'cls-py-3b', total: 8, aaravPresent: 0 },

    // Sem 5 Div A
    { classId: 'cls-cn-5a', total: 12, aaravPresent: 0 },
    { classId: 'cls-cloud-5a', total: 10, aaravPresent: 0 },
    { classId: 'cls-ml-5a', total: 10, aaravPresent: 0 },
    { classId: 'cls-ca-5a', total: 8, aaravPresent: 0 },
  ];

  let recordIdx = 1;

  classDistributions.forEach(({ classId, total, aaravPresent }) => {
    const cls = initialClasses.find((c) => c.id === classId);
    if (!cls) return;

    // Enrolled students in this class
    const enrolledStudents = initialStudents.filter(
      (s) => s.semester === cls.semester && s.division === cls.division
    );

    for (let sessionNum = 1; sessionNum <= total; sessionNum++) {
      const sessionId = `sess-${classId}-${sessionNum}`;
      // Distribute lectures across the last 35 days
      const dayOffset = Math.floor((total - sessionNum + 1) * 2.2);
      const sessionDate = new Date(Date.now() - dayOffset * 86400000);
      // Skip Sundays
      if (sessionDate.getDay() === 0) {
        sessionDate.setDate(sessionDate.getDate() - 1);
      }
      const dateStr = sessionDate.toISOString().split('T')[0];

      enrolledStudents.forEach((stu) => {
        let isPresent = true;
        let isLate = false;

        // Custom attendance profiles for specific test personas
        if (stu.id === 'stu-1') {
          // Aarav Patel: 85.7% (48 out of 56 conducted across all 6 Sem 3-A classes)
          isPresent = sessionNum <= aaravPresent;
          if (isPresent && sessionNum % 5 === 0) isLate = true;
        } else if (stu.id === 'stu-2') {
          // Priya Sharma: High achiever ~96%
          isPresent = sessionNum !== 3;
        } else if (stu.id === 'stu-3') {
          // Rohan Kulkarni: Defaulter ~62%
          isPresent = sessionNum <= Math.round(total * 0.62);
        } else if (stu.id === 'stu-10') {
          // Riya Sen: Severe Defaulter ~55%
          isPresent = sessionNum <= Math.round(total * 0.55);
        } else if (stu.id === 'stu-14') {
          // Aditya Verma: Borderline ~72%
          isPresent = sessionNum <= Math.round(total * 0.72);
        } else if (stu.id === 'stu-20') {
          // Aryan Kapoor: Defaulter ~64%
          isPresent = sessionNum <= Math.round(total * 0.64);
        } else if (stu.id === 'stu-24') {
          // Simran Kaur: Defaulter ~58%
          isPresent = sessionNum <= Math.round(total * 0.58);
        } else if (stu.id === 'stu-25') {
          // Tanvi Iyer: Borderline ~73%
          isPresent = sessionNum <= Math.round(total * 0.73);
        } else if (stu.id === 'stu-28') {
          // Chirag Sethi (Div B): Defaulter ~60%
          isPresent = sessionNum <= Math.round(total * 0.60);
        } else if (stu.id === 'stu-42') {
          // Waseem Akram (Sem 5): Defaulter ~63%
          isPresent = sessionNum <= Math.round(total * 0.63);
        } else {
          // General student distribution ~80% - 92%
          const seedNum = (parseInt(stu.roll_number, 10) * 7 + sessionNum * 13) % 100;
          isPresent = seedNum > 18; // ~82% attendance
          if (isPresent && seedNum > 90) isLate = true;
        }

        records.push({
          id: `rec-${recordIdx++}`,
          session_id: sessionId,
          student_id: stu.id,
          class_id: classId,
          status: !isPresent ? 'ABSENT' : isLate ? 'LATE' : 'PRESENT',
          marked_at: `${dateStr}T10:05:00`,
          method: isPresent ? (sessionNum % 3 === 0 ? 'MANUAL' : 'QR') : 'MANUAL',
        });
      });
    }
  });

  return records;
}

export const initialRecords: AttendanceRecord[] = generateSeedAttendanceRecords();

export const initialCorrectionRequests: CorrectionRequest[] = [
  {
    id: 'req-1',
    student_id: 'stu-4',
    student_name: 'Sneha Gupta',
    roll_number: '04',
    class_id: 'cls-os-3a',
    subject_name: 'Operating Systems',
    date: '2026-09-14',
    reason: 'I was present in class but the dynamic QR expired right as I clicked scan. Professor Sharma permitted me to sit in.',
    status: 'PENDING',
    created_at: '2026-09-14T12:30:00',
  },
  {
    id: 'req-2',
    student_id: 'stu-1',
    student_name: 'Aarav Patel',
    roll_number: '01',
    class_id: 'cls-dbms-3a',
    subject_name: 'Database Management Systems',
    date: '2026-09-10',
    reason: 'Attended the college tech symposium representing our department with OD approval letter.',
    status: 'APPROVED',
    faculty_comment: 'OD verified with HOD. Marked as Present.',
    created_at: '2026-09-10T15:00:00',
  },
  {
    id: 'req-3',
    student_id: 'stu-3',
    student_name: 'Rohan Kulkarni',
    roll_number: '03',
    class_id: 'cls-maths-3a',
    subject_name: 'Applied Mathematics III',
    date: '2026-09-08',
    reason: 'Had a severe migraine and visited the campus medical room. Medical certificate submitted to proctor.',
    status: 'PENDING',
    created_at: '2026-09-08T16:45:00',
  },
  {
    id: 'req-4',
    student_id: 'stu-14',
    student_name: 'Aditya Verma',
    roll_number: '14',
    class_id: 'cls-py-3a',
    subject_name: 'Advanced Python & OOP',
    date: '2026-09-05',
    reason: 'Network outage in Lab 2 prevented my device from authenticating with the local session host.',
    status: 'REJECTED',
    faculty_comment: 'Attendance log shows session was opened for 20 minutes with zero lab disconnects.',
    created_at: '2026-09-05T17:10:00',
  },
  {
    id: 'req-5',
    student_id: 'stu-26',
    student_name: 'Varun Reddy',
    roll_number: '01',
    class_id: 'cls-dbms-3b',
    subject_name: 'Database Management Systems',
    date: '2026-09-12',
    reason: 'Participated in Inter-College Cricket Tournament semi-finals as College Team Captain.',
    status: 'APPROVED',
    faculty_comment: 'Sports director verified OD certificate. Attendance granted.',
    created_at: '2026-09-12T14:20:00',
  },
  {
    id: 'req-6',
    student_id: 'stu-20',
    student_name: 'Aryan Kapoor',
    roll_number: '20',
    class_id: 'cls-se-3a',
    subject_name: 'Software Engineering & Agile',
    date: '2026-09-11',
    reason: 'Fingerprint / QR scanner glitched during roll call entry.',
    status: 'PENDING',
    created_at: '2026-09-11T11:00:00',
  },
];

export const initialAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Mandatory 75% Minimum Attendance Policy for Term-End Exams',
    content: 'All undergraduate students must maintain an overall minimum of 75% attendance across all registered courses to be eligible for the upcoming semester examinations. Defaulter lists have been published on the departmental noticeboards.',
    date: '2026-09-15',
    category: 'ATTENDANCE',
    author: 'Dean of Academic Affairs',
  },
  {
    id: 'ann-2',
    title: 'Mid-Semester Examinations Schedule Released',
    content: 'The mid-term examination timetable for Semester 3 & Semester 5 has been published. Practical lab vivas commence next week. Hall tickets will be issued only upon proctor clearance.',
    date: '2026-09-12',
    category: 'ACADEMIC',
    author: 'Examination Cell',
  },
  {
    id: 'ann-3',
    title: 'Smart Attendance Grievance & On-Duty (OD) Submission Window',
    content: 'Students with pending On-Duty (OD) slips from sports tournaments or technical symposia must submit their correction requests through AttendPulse before Friday 5:00 PM.',
    date: '2026-09-11',
    category: 'ALERT',
    author: 'Prof. Sharma (Attendance Coordinator)',
  },
  {
    id: 'ann-4',
    title: 'Annual Hackathon & Project Expo 2026 Live Registration',
    content: 'Registration for the 36-hour National Hackathon is now open. Participants representing the college will receive authorized academic attendance credits.',
    date: '2026-09-08',
    category: 'GENERAL',
    author: 'Student Technical Council',
  },
  {
    id: 'ann-5',
    title: 'Guest Lecture: Scalable Cloud Architectures with AWS',
    content: 'Industry expert session scheduled for all Semester 3 & 5 students this Saturday at Seminar Hall 1 from 10:30 AM to 12:30 PM. Mandatory attendance.',
    date: '2026-09-04',
    category: 'ACADEMIC',
    author: 'Department of Computer Engineering',
  },
];
