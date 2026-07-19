import { BadRequestException } from '@nestjs/common';
import { FindOperator } from 'typeorm';
import { AvailabilityService } from './availability.service';
import { BOOKING_LEAD_TIME_MS } from '../appointment/booking-lead-time';

describe('AvailabilityService', () => {
  const createService = (overlappingSlot: unknown = null) => {
    type FindOptions = {
      where: { startTime: FindOperator<Date> };
    };
    let capturedFindOptions: FindOptions | null = null;
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(overlappingSlot),
    };
    const slotRepo = {
      create: jest.fn((value: Record<string, unknown>) => value),
      save: jest.fn((value: Record<string, unknown>) =>
        Promise.resolve({ id: 'slot-1', ...value }),
      ),
      find: jest.fn((options: FindOptions) => {
        capturedFindOptions = options;
        return Promise.resolve([]);
      }),
      createQueryBuilder: jest.fn(() => queryBuilder),
    };
    const therapistRepo = {
      findOne: jest.fn((options: { where: { id: string } }) =>
        Promise.resolve({
          id: options.where.id,
          name: 'Therapist',
        }),
      ),
    };

    return {
      service: new AvailabilityService(
        slotRepo as never,
        therapistRepo as never,
      ),
      queryBuilder,
      slotRepo,
      getCapturedFindOptions: () => capturedFindOptions,
    };
  };

  it('checks overlapping slots only for the same therapist', async () => {
    const { service, queryBuilder } = createService();
    const startTime = new Date(Date.now() + 25 * 60 * 60 * 1000);
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
    const startTime = new Date(Date.now() + 25 * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    await expect(
      service.create({
        therapistId: 'therapist-a',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('prevents therapists from posting slots less than 24 hours away', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalBypass = process.env.BOOKING_LEAD_TIME_BYPASS_ENABLED;
    process.env.NODE_ENV = 'production';
    process.env.BOOKING_LEAD_TIME_BYPASS_ENABLED = 'false';
    const { service } = createService();
    const startTime = new Date(Date.now() + 23 * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    try {
      await expect(
        service.create({
          therapistId: 'therapist-a',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      ).rejects.toThrow(
        'Availability slots must start at least 24 hours from the current time.',
      );
    } finally {
      if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = originalNodeEnv;
      if (originalBypass === undefined) {
        delete process.env.BOOKING_LEAD_TIME_BYPASS_ENABLED;
      } else {
        process.env.BOOKING_LEAD_TIME_BYPASS_ENABLED = originalBypass;
      }
    }
  });

  it('lists only slots beyond the production 24-hour booking cutoff', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalBypass = process.env.BOOKING_LEAD_TIME_BYPASS_ENABLED;
    process.env.NODE_ENV = 'production';
    process.env.BOOKING_LEAD_TIME_BYPASS_ENABLED = 'true';
    const before = Date.now();
    const { service, getCapturedFindOptions } = createService();

    try {
      await service.getAvailableSlots('therapist-a');
      const findOptions = getCapturedFindOptions();
      expect(findOptions).not.toBeNull();
      if (!findOptions) throw new Error('Expected availability find options');
      const cutoff = findOptions.where.startTime.value;

      expect(cutoff.getTime()).toBeGreaterThanOrEqual(
        before + BOOKING_LEAD_TIME_MS,
      );
    } finally {
      if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = originalNodeEnv;
      if (originalBypass === undefined) {
        delete process.env.BOOKING_LEAD_TIME_BYPASS_ENABLED;
      } else {
        process.env.BOOKING_LEAD_TIME_BYPASS_ENABLED = originalBypass;
      }
    }
  });
});
