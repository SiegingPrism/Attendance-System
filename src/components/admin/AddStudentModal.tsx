import React, { useState, useEffect } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { X, UserPlus, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (studentName: string) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { departments, classes, subjects, students, addStudent } = useAttendance();

  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [departmentId, setDepartmentId] = useState('dept-ce');
  const [semester, setSemester] = useState<number>(3);
  const [division, setDivision] = useState('A');
  const [seedAttendance, setSeedAttendance] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-suggest enrollment and email when roll and name change
  useEffect(() => {
    if (rollNumber.trim() && !enrollmentNumber) {
      const paddedRoll = rollNumber.trim().padStart(2, '0');
      setEnrollmentNumber(`EN2024${paddedRoll}`);
    }
  }, [rollNumber]);

  useEffect(() => {
    if (name.trim() && !email) {
      const cleanName = name.trim().toLowerCase().replace(/\s+/g, '.');
      setEmail(`${cleanName}@student.college.edu`);
    }
  }, [name]);

  if (!isOpen) return null;

  // Matching classes for this cohort
  const matchingClasses = classes.filter(
    (c) => c.semester === semester && c.division === division
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanRoll = rollNumber.trim();

    if (!cleanName) {
      setError('Please enter the student’s full name.');
      return;
    }
    if (!cleanRoll) {
      setError('Please enter a valid roll number.');
      return;
    }

    // Check duplicate roll in same semester & division
    const duplicate = students.find(
      (s) =>
        s.semester === semester &&
        s.division.toUpperCase() === division.toUpperCase() &&
        s.roll_number.toLowerCase() === cleanRoll.toLowerCase()
    );

    if (duplicate) {
      setError(`Roll number "${cleanRoll}" is already assigned to ${duplicate.name} in Semester ${semester}, Division ${division}.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const newStu = addStudent({
        name: cleanName,
        roll_number: cleanRoll,
        enrollment_number: enrollmentNumber.trim() || undefined,
        email: email.trim() || undefined,
        department_id: departmentId,
        semester,
        division,
        seedAttendance,
      });

      setIsSubmitting(false);
      // Reset form
      setName('');
      setRollNumber('');
      setEnrollmentNumber('');
      setEmail('');
      if (onSuccess) onSuccess(newStu.name);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || 'Failed to register student.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
        {/* Head */}
        <div className="modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--r-sm)',
                background: 'var(--blue-50)',
                border: '1px solid var(--blue-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--blue-600)',
              }}
            >
              <UserPlus size={17} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.0625rem', margin: 0, fontWeight: 700, color: 'var(--gray-900)' }}>
                Add New Student
              </h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                Register student into official academic database and enroll in classes
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div className="alert alert-danger" style={{ padding: '0.65rem 0.875rem' }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Name and Roll Number */}
            <div className="grid-2" style={{ gap: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ishani Bassin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Roll Number *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 26"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Enrollment ID and Email */}
            <div className="grid-2" style={{ gap: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Enrollment / PRN Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. EN202426"
                  value={enrollmentNumber}
                  onChange={(e) => setEnrollmentNumber(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">College Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. name@student.college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Academic Cohort Placement */}
            <div
              style={{
                background: 'var(--gray-50)',
                padding: '0.875rem',
                borderRadius: 'var(--r-sm)',
                border: '1px solid var(--gray-200)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gray-500)' }}>
                Academic Placement &amp; Cohort
              </div>

              <div className="grid-3" style={{ gap: '0.625rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Semester</label>
                  <select
                    className="form-select"
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Division</label>
                  <select
                    className="form-select"
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                  >
                    {['A', 'B', 'C', 'D'].map((d) => (
                      <option key={d} value={d}>
                        Division {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Class Auto-Enrollment Preview */}
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--gray-600)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  paddingTop: '0.25rem',
                }}
              >
                <GraduationCap size={14} color="var(--blue-600)" />
                <span>
                  Will auto-enroll in <strong>{matchingClasses.length} course(s)</strong> for Sem {semester} (Div {division})
                  {matchingClasses.length > 0 &&
                    `: ${matchingClasses
                      .map((c) => subjects.find((s) => s.id === c.subject_id)?.code)
                      .filter(Boolean)
                      .join(', ')}`}
                </span>
              </div>
            </div>

            {/* Baseline Attendance Seed Option */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8125rem',
                color: 'var(--gray-700)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={seedAttendance}
                onChange={(e) => setSeedAttendance(e.target.checked)}
                style={{ accentColor: 'var(--blue-600)', width: 16, height: 16 }}
              />
              <span>Generate realistic past attendance history (~80% baseline) for registered classes</span>
            </label>
          </div>

          {/* Modal Footer */}
          <div className="modal-foot">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <UserPlus size={14} />
              {isSubmitting ? 'Registering Student…' : 'Register Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
