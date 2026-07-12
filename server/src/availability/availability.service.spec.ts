import { BadRequestException } from '@nestjs/common';
import { AvailabilityService } from './availability.service';

describe('AvailabilityService', () => {
  const createService = (overlappingSlot: unknown = null) => {
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(overlappingSlot),
    };
    const slotRepo = {
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => ({ id: 'slot-1', ...value })),
      createQueryBuilder: jest.fn(() => queryBuilder),
    };
    const therapistRepo = {
      findOne: jest.fn(async ({ where }) => ({
        id: where.id,
        name: 'Therapist',
      })),
    };

    return {
      service: new AvailabilityService(
        slotRepo as never,
        therapistRepo as never,
      ),
      queryBuilder,
      slotRepo,
    };
  };

  it('checks overlapping slots only for the same therapist', async () => {
    const { service, queryBuilder } = createService();
    const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    await service.create({
      therapistId: 'therapist-a',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    });

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'slot.therapistId = :therapistId',
      { therapistId: 'therapist-a' },
    );
  });

  it('still blocks overlaps for one therapist', async () => {
    const { service } = createService({ id: 'existing-slot' });
    const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    await expect(
      service.create({
        therapistId: 'therapist-a',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
