export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type AttendanceMethod = 'QR' | 'MANUAL' | 'FACE';

export type SessionStatus = 'ACTIVE' | 'CLOSED';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  department_id: string;
  semester?: number;
}

export interface FaceBiometricProfile {
  student_id: string;
  enrolled_at: string;
  photo_url: string;
  descriptor?: number[]; // normalized facial embedding vector
  face_features?: {
    eye_distance_ratio: number;
    face_aspect_ratio: number;
  };
}

export interface Student {
  id: string;
  user_id: string;
  name: string;
  email: string;
  roll_number: string;
  enrollment_number: string;
  department_id: string;
  semester: number;
  division: string;
  avatar?: string;
  face_registered?: boolean;
  face_photo?: string;
  face_profile?: FaceBiometricProfile;
}

export interface DetectedFace {
  id: string;
  student_id?: string;
  student_name?: string;
  roll_number?: string;
  bounding_box: {
    x: number; // percentage 0-100 or normalized
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  distance_meters: number;
  recommended_zoom: number;
  status: 'TRACKING' | 'VERIFIED' | 'UNENROLLED';
  landmarks?: Array<{ x: number; y: number }>;
  raw_descriptor?: number[];
  lock_progress?: number; // 0 - 100%
  row_tier?: 'FRONT' | 'MID' | 'BACK';
  is_locked?: boolean;
}

export type ScanTrackingMode = 'AUTO_PATROL' | 'SMART_FOCUS' | 'MANUAL';
export type ClassroomRoomPreset = 'SEMINAR' | 'STANDARD' | 'LECTURE_HALL' | 'CUSTOM';

export interface ScannerSettings {
  confidenceThreshold: number; // e.g. 0.80
  maxZoom: number; // e.g. 4.0
  zoomSpeed: 'SMOOTH' | 'BALANCED' | 'RAPID';
  showMesh: boolean;
  soundFeedback: boolean;
  selectedDeviceId?: string;
  classroomDepthFactor: number;
  trackingMode?: ScanTrackingMode;
  roomPreset?: ClassroomRoomPreset;
  holdDurationMs?: number;
}

export interface Faculty {
  id: string;
  user_id: string;
  name: string;
  email: string;
  department_id: string;
  employee_id: string;
  designation: string;
  avatar?: string;
}

export interface CollegeClass {
  id: string;
  subject_id: string;
  faculty_id: string;
  semester: number;
  division: string;
  room: string;
  schedule_time: string; // e.g. "10:00 - 11:00 AM"
  day_of_week: string; // "Monday", etc.
}

export interface Enrollment {
  id: string;
  student_id: string;
  class_id: string;
}

export interface AttendanceSession {
  id: string;
  class_id: string;
  faculty_id: string;
  start_time: string;
  end_time?: string;
  status: SessionStatus;
  qr_token: string;
  token_generated_at: number; // timestamp ms
  expires_at: number; // timestamp ms
  token_refresh_interval_sec: number; // default 30
  topic?: string;
}

export type LeaveType = 'MEDICAL' | 'ON_DUTY_EVENT' | 'SPORTS' | 'PERSONAL';

export interface LeaveApplication {
  id: string;
  student_id: string;
  student_name: string;
  roll_number: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  document_name?: string;
  status: RequestStatus; // 'PENDING' | 'APPROVED' | 'REJECTED'
  faculty_comment?: string;
  applied_at: string;
  affected_class_ids?: string[];
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  class_id: string;
  status: AttendanceStatus;
  marked_at: string;
  method: AttendanceMethod;
}

export interface CorrectionRequest {
  id: string;
  student_id: string;
  student_name: string;
  roll_number: string;
  session_id?: string;
  class_id: string;
  subject_name: string;
  date: string;
  reason: string;
  status: RequestStatus;
  faculty_comment?: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'GENERAL' | 'ACADEMIC' | 'ATTENDANCE' | 'ALERT';
  author: string;
}

export interface SubjectAttendanceStat {
  subject_id: string;
  subject_name: string;
  subject_code: string;
  conducted: number;
  present: number;
  absent: number;
  excused: number;
  percentage: number;
  safe_misses: number; // how many more classes can be missed while remaining >= 75%
  required_attend: number; // how many consecutive classes needed to reach 75% if below
  faculty_name: string;
}

export interface OverallAttendanceSummary {
  total_conducted: number;
  total_present: number;
  total_absent: number;
  total_excused: number;
  percentage: number;
  safe_misses: number;
  required_attend: number;
  is_low_attendance: boolean;
}

export type AcademicEventType = 'HOLIDAY' | 'EXAM_WEEK' | 'FESTIVAL' | 'VACATION' | 'ACADEMIC_DEADLINE';

export interface AcademicEvent {
  id: string;
  title: string;
  description?: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  type: AcademicEventType;
  affects_attendance: boolean; // if true, non-instructional day with classes suspended
  created_by: string; // 'Academic Dean Office' or faculty name
}

export interface ExtraClassSchedule {
  id: string;
  class_id: string;
  faculty_id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // e.g. "10:00 AM"
  end_time: string;   // e.g. "11:30 AM"
  room: string;
  topic: string;
  reason: string; // e.g. "Compensatory lecture for missed session"
  is_conducted: boolean;
}
