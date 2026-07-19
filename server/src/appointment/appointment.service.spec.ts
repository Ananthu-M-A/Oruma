import { ConflictException } from '@nestjs/common';
import { AppointmentService } from './appointment.service';

describe('AppointmentService quick booking', () => {
  it('does not issue a booking token for an existing patient contact', async () => {
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          id: 'existing-patient',
          email: 'patient@example.com',
          phone: '918157039987',
        },
      ]),
    };
    const userRepository = {
      createQueryBuilder: jest.fn(() => queryBuilder),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    const manager = {
      getRepository: jest.fn(() => userRepository),
    };
    const dataSource = {
      transaction: (
        runInTransaction: (entityManager: typeof manager) => Promise<unknown>,
      ) => runInTransaction(manager),
    };
    const service = new AppointmentService(
      {} as never,
      {} as never,
      {} as never,
      dataSource as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(
      service.createQuickBooking({
        slotId: '00000000-0000-4000-8000-000000000000',
        contactEmail: 'patient@example.com',
        contactPhone: '+91 81570 39987',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
