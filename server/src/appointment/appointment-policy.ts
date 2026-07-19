import { AppointmentStatus } from './entities/appointment-status.enum';

export const PATIENT_CANCELLATION_WINDOW_MS = 60 * 60 * 1000;

const allowedStatusTransitions: Record<AppointmentStatus, AppointmentStatus[]> =
  {
    [AppointmentStatus.PENDING]: [
      AppointmentStatus.CONFIRMED,
      AppointmentStatus.CANCELLED,
    ],
    [AppointmentStatus.CONFIRMED]: [
      AppointmentStatus.COMPLETED,
      AppointmentStatus.CANCELLED,
    ],
    [AppointmentStatus.COMPLETED]: [],
    [AppointmentStatus.CANCELLED]: [],
  };

export function canTransitionAppointmentStatus(
  currentStatus: AppointmentStatus,
  nextStatus: AppointmentStatus,
) {
  return (
    currentStatus === nextStatus ||
    allowedStatusTransitions[currentStatus].includes(nextStatus)
  );
}

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
