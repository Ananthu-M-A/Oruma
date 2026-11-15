import { ReservationCleanupService } from './reservation-cleanup.service';
import { AppointmentStatus } from './entities/appointment-status.enum';
import { SlotStatus } from '../availability/entities/slot-status.enum';

describe('ReservationCleanupService', () => {
  it('cancels an expired unpaid reservation and releases its slot', async () => {
    const appointment = {
      id: 'appointment-1',
      status: AppointmentStatus.PENDING,
      reservationExpiresAt: new Date(Date.now() - 60_000),
      meetingLink: null,
      patient: { id: 'patient-1' },
      slot: { id: 'slot-1', status: SlotStatus.BOOKED },
    };
    const queryBuilder = {
      setLock: jest.fn().mockReturnThis(),
      setOnLocked: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([appointment]),
    };
    const appointmentRepository = {
      createQueryBuilder: jest.fn(() => queryBuilder),
      save: jest.fn().mockImplementation((value: unknown) => value),
    };
    const slotRepository = {
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const manager = {
      getRepository: jest
        .fn()
        .mockReturnValueOnce(appointmentRepository)
        .mockReturnValueOnce(slotRepository),
    };
    const dataSource = {
      transaction: jest.fn(
        (callback: (value: typeof manager) => Promise<unknown>) =>
          callback(manager),
      ),
    };
    const service = new ReservationCleanupService(
      dataSource as never,
      { get: jest.fn((_key: string, fallback: string) => fallback) } as never,
      {} as never,
    );
    const now = new Date();

    await expect(service.expireReservations(now)).resolves.toEqual([
      appointment,
    ]);
    expect(queryBuilder.setLock).toHaveBeenCalledWith(
      'pessimistic_write',
      undefined,
      ['appointment'],
    );
    expect(appointment).toEqual(
      expect.objectContaining({
        status: AppointmentStatus.CANCELLED,
        reservationExpiresAt: null,
        cancelledAt: now,
        cancellationReason: 'Unpaid reservation expired',
      }),
    );
    expect(slotRepository.update).toHaveBeenCalledWith(
      { id: 'slot-1', status: SlotStatus.BOOKED },
      { status: SlotStatus.AVAILABLE },
    );
  });
});
