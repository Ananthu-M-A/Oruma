export const PATIENT_CANCELLATION_WINDOW_MS = 60 * 60 * 1000;

export function canPatientCancelAppointment(
  createdAt: Date,
  sessionStartsAt: Date,
  now = new Date(),
) {
  const createdTime = createdAt.getTime();
  const startTime = sessionStartsAt.getTime();
  const currentTime = now.getTime();

  if (![createdTime, startTime, currentTime].every(Number.isFinite)) {
    return false;
  }

  return (
    currentTime >= createdTime &&
    currentTime <= createdTime + PATIENT_CANCELLATION_WINDOW_MS &&
    currentTime < startTime
  );
}
