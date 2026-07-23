import { ProviderJobService } from './provider-job.service';
import {
  ProviderJob,
  ProviderJobKind,
  ProviderJobStatus,
} from './entities/provider-job.entity';

describe('ProviderJobService', () => {
  const makeJob = (overrides: Partial<ProviderJob> = {}) =>
    Object.assign(new ProviderJob(), {
      id: 'job-1',
      kind: ProviderJobKind.EMAIL,
      status: ProviderJobStatus.PENDING,
      payload: { to: 'patient@example.com', subject: 'Hello', text: 'Body' },
      deduplicationKey: 'email:test',
      attempts: 0,
      maxAttempts: 3,
      nextAttemptAt: new Date(),
      lockedAt: null,
      completedAt: null,
      lastError: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    });

  it('returns an existing idempotent job instead of enqueuing a duplicate', async () => {
    const existing = makeJob();
    const repository = {
      findOne: jest.fn().mockResolvedValue(existing),
      create: jest.fn(),
      save: jest.fn(),
    };
    const service = new ProviderJobService(
      repository as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(
      service.enqueueEmail(
        { to: 'patient@example.com', subject: 'Hello', text: 'Body' },
        { deduplicationKey: 'email:test' },
      ),
    ).resolves.toBe(existing);
    expect(repository.create).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('claims a due job, dispatches it once, and redacts its payload', async () => {
    const job = makeJob();
    const queryBuilder = {
      setLock: jest.fn().mockReturnThis(),
      setOnLocked: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([job]),
    };
    const repository = {
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      createQueryBuilder: jest.fn(() => queryBuilder),
    };
    const dataSource = {
      transaction: jest.fn(
        (
          callback: (manager: {
            getRepository: () => typeof repository;
          }) => Promise<unknown>,
        ) => callback({ getRepository: () => repository }),
      ),
    };
    const config = {
      get: jest.fn((_key: string, fallback?: string) => fallback),
    };
    const mail = { send: jest.fn().mockResolvedValue(true) };
    const service = new ProviderJobService(
      repository as never,
      dataSource as never,
      config as never,
      mail as never,
      {} as never,
      {} as never,
    );

    await service.processDueJobs();

    expect(mail.send).toHaveBeenCalledTimes(1);
    expect(repository.update).toHaveBeenCalledWith(
      job.id,
      expect.objectContaining({
        status: ProviderJobStatus.SUCCEEDED,
        attempts: 1,
        payload: { redacted: true },
      }),
    );
  });
});
