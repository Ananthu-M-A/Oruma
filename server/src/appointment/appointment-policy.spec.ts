import {
  canPatientCancelAppointment,
  canTransitionAppointmentStatus,
  PATIENT_CANCELLATION_WINDOW_MS,
} from './appointment-policy';
import { AppointmentStatus } from './entities/appointment-status.enum';

describe('appointment cancellation policy', () => {
  const createdAt = new Date('2026-07-19T04:30:00.000Z');
  const sessionStartsAt = new Date('2026-07-20T04:30:00.000Z');

  it('allows patient cancellation during the first hour after booking', () => {
    expect(
      canPatientCancelAppointment(
        createdAt,
        sessionStartsAt,
        new Date(createdAt.getTime() + PATIENT_CANCELLATION_WINDOW_MS),
      ),
    ).toBe(true);
  });

  it('rejects patient cancellation after the one-hour window', () => {
    expect(
      canPatientCancelAppointment(
        createdAt,
        sessionStartsAt,
        new Date(createdAt.getTime() + PATIENT_CANCELLATION_WINDOW_MS + 1),
      ),
    ).toBe(false);
  });

  it('rejects cancellation once the session has started', () => {
    expect(
      canPatientCancelAppointment(createdAt, sessionStartsAt, sessionStartsAt),
    ).toBe(false);
  });
});

describe('appointment status policy', () => {
  it('allows the normal pending-to-confirmed-to-completed lifecycle', () => {
    expect(
      canTransitionAppointmentStatus(
        AppointmentStatus.PENDING,
        AppointmentStatus.CONFIRMED,
      ),
    ).toBe(true);
    expect(
      canTransitionAppointmentStatus(
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.COMPLETED,
      ),
    ).toBe(true);
  });

  it('keeps completed and cancelled appointments terminal', () => {
    expect(
      canTransitionAppointmentStatus(
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CONFIRMED,
      ),
    ).toBe(false);
    expect(
      canTransitionAppointmentStatus(
        AppointmentStatus.CANCELLED,
        AppointmentStatus.PENDING,
      ),
    ).toBe(false);
  });
});
