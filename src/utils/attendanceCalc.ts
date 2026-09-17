export interface CalculationResult {
  conducted: number;
  present: number;
  absent: number;
  excused: number;
  percentage: number;
  safeMisses: number;
  requiredAttend: number;
  isLowAttendance: boolean;
  message: string;
}

/**
 * Calculates attendance metrics including percentage and safe miss / catch-up targets.
 * Standard requirement: 75% attendance threshold (customizable).
 */
export function calculateAttendanceMetrics(
  present: number,
  totalConducted: number,
  threshold = 0.75
): CalculationResult {
  if (totalConducted <= 0) {
    return {
      conducted: 0,
      present: 0,
      absent: 0,
      excused: 0,
      percentage: 100,
      safeMisses: 0,
      requiredAttend: 0,
      isLowAttendance: false,
      message: 'No classes conducted yet.',
    };
  }

  const rawPercentage = (present / totalConducted) * 100;
  const percentage = Math.round(rawPercentage * 10) / 10;
  const absent = Math.max(0, totalConducted - present);

  if (rawPercentage >= threshold * 100) {
    // Formula: floor((present - threshold * total) / threshold)
    const safeMisses = Math.floor((present - threshold * totalConducted) / threshold);
    return {
      conducted: totalConducted,
      present,
      absent,
      excused: 0,
      percentage,
      safeMisses: Math.max(0, safeMisses),
      requiredAttend: 0,
      isLowAttendance: false,
      message:
        safeMisses > 0
          ? `You can safely miss ${safeMisses} more ${safeMisses === 1 ? 'class' : 'classes'} and stay above ${threshold * 100}%.`
          : `You are right on track at ${percentage}%. Do not miss any upcoming classes to stay above ${threshold * 100}%.`,
    };
  } else {
    // Formula: ceil((threshold * total - present) / (1 - threshold))
    const requiredAttend = Math.ceil(
      (threshold * totalConducted - present) / (1 - threshold)
    );
    return {
      conducted: totalConducted,
      present,
      absent,
      excused: 0,
      percentage,
      safeMisses: 0,
      requiredAttend: Math.max(1, requiredAttend),
      isLowAttendance: true,
      message: `You need to attend the next ${requiredAttend} consecutive ${
        requiredAttend === 1 ? 'class' : 'classes'
      } without missing to reach ${threshold * 100}%.`,
    };
  }
}
