# AttendPulse — Modern University Attendance & Academic Management System

AttendPulse is a comprehensive, institutional-grade web portal designed for colleges and universities to manage student attendance, lecture scheduling, academic calendars, and examination eligibility.

---

## 🚀 Key Features

### 🎓 Student Portal
- **Biometric Face Enrollment**: Self-service student facial profile enrollment modal with real-time oval framing guide and camera snapshot/upload capabilities.
- **Dynamic QR Code Check-in**: Fast attendance check-in with simulated geolocation verification.
- **Real-Time Attendance Analytics**: Subject-wise percentage, conducted vs. attended metrics, and safe-to-miss / catch-up calculators.
- **Official Examination Hall Ticket & Detention Alerts**:
  - Students $\ge 75\%$: Printable official **Semester Examination Admit Card / Hall Ticket** with enrolled subjects, credits, and barcode verification.
  - Students $< 75\%$: Official **Detention Warning Notice** citing university attendance regulations and grievance appeal guidance.
- **Medical & On-Duty (OD) Leave Applications**: Submit medical or institutional event leaves with file attachments and reason. Approved leaves grant `EXCUSED` attendance credit.
- **Academic Calendar & Holidays**: View upcoming public holidays, exam weeks, and special compensatory lectures.

### 👨‍🏫 Faculty Portal
- **AI Facial Recognition with Classroom Distance Auto-Zoom**:
  - **Optical Distance Estimation**: Automatically computes student physical distance ($0.8\text{m} - 7.5\text{m}$) using pinhole facial geometry and interpupillary scale.
  - **Dynamic Camera Auto-Zoom**: Automatically zooms in ($1.0\times$ to $4.0\times$) to magnify students in distant lecture hall rows (e.g., Row 3 to Back Bench) and smoothly pulls back for wide panoramic shots.
  - **Hands-Free Auto-Attendance**: Matches facial descriptors against enrolled class rosters in real-time, automatically marking students `PRESENT` (`method: 'FACE'`) with auditory chimes and live roster check-offs.
  - **Interactive Classroom Simulation Deck**: Direct preset testing for Front Row ($1.2\text{m}$), Mid Row ($3.4\text{m}$), Back Bench ($5.8\text{m}$), Multi-Aisle Pan, or physical webcam.
- **Rotating QR Code Session Engine**: Launch live attendance sessions with dynamic token rotation, live attendee counter, and topic coverage input.
- **1-Click Quick Roll Call**: Fast manual attendance sheet with bulk-mark toggles (Present/Absent/Late).
- **Compensatory & Extra Class Scheduler**: Schedule Saturday or evening extra lectures to cover syllabus, automatically broadcasting alerts to enrolled students.
- **Medical & OD Leave Review Center**: Dedicated inbox to review student leave requests, inspect certificates, and grant attendance credit.
- **Goal Calculator Tool**: Simulate upcoming classes (+1 Attended / +1 Missed) for any student to provide catch-up advice.
- **Lecture History & Syllabus Ledger**: Searchable past lecture log with editable attendance records.

### 🏛️ Administration Console
- **Campus-Wide Attendance Reports**: Filter by Department, Semester, Division, and Defaulter status ($<75\%$).
- **Official Examination Detention List**: Printable campus-wide debarred registry with official signature blocks for the Dean and Controller of Examinations.
- **Defaulter Notice Board & Multi-Channel Dispatch**: Broadcast official attendance notices and trigger automated Email & SMS warnings to students and guardians.
- **Master Timetable & Class Allotment**: Allocate faculty to classes, configure lecture rooms, and manage division schedules.
- **Curriculum & Subject Management**: Configure courses, credit points, subject codes, and semester allocations.
- **Academic Calendar & Holiday Management**: Add, modify, or remove university holidays, semester breaks, and examination weeks.
- **Batch CSV/Excel Student & Timetable Importers**: Seamless bulk onboarding.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Native Vanilla CSS design system with custom CSS variables, glassmorphism, responsive modals, and print stylesheets
- **Icons**: Lucide React
- **Security & Utilities**: Canvas-based dynamic QR generator & scanner simulation, date calculation engine

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone git@github.com:SiegingPrism/Attendance-System.git
cd Attendance-System

# Install dependencies
npm install

# Start local development server
npm run dev
```

The application will be available at `http://localhost:5173`.

### Production Build
```bash
npm run build
```

---

## 📄 License

MIT License. Designed & developed for modern higher education institutions.
