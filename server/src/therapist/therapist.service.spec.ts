import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, IsNull } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Appointment } from '../appointment/entities/appointment.entity';
import { AvailabilitySlot } from '../availability/entities/availability-slot.entity';
import { NotificationService } from '../notification/notification.service';
import { UserService } from '../user/user.service';
import { Therapist } from './entities/therapist.entity';
import { TherapistService } from './therapist.service';
import { ProviderJobService } from '../reliability/provider-job.service';
import { TherapistVerificationStatus } from './entities/therapist-verification-status.enum';
import { MediaService } from '../media/media.service';
import { User } from '../user/entities/user.entity';
import { SendMailInput } from '../mail/mail.service';

describe('TherapistService', () => {
  let service: TherapistService;
  const therapistQueryBuilder = {
    addSelect: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
  };
  const therapistRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => therapistQueryBuilder),
  };
  const appointmentRepository = {
    find: jest.fn(),
  };
  const slotRepository = {
    find: jest.fn(),
  };
  const userService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    updateEmail: jest.fn(),
    remove: jest.fn(),
  };
  const configService = {
    get: jest.fn(),
  };
  const notificationService = {
    create: jest.fn(),
  };
  const providerJobService = {
    enqueueEmail:
      jest.fn<
        (
          input: SendMailInput,
          options?: { deduplicationKey?: string },
        ) => Promise<unknown>
      >(),
  };
  const mediaService = {
    delete: jest.fn().mockResolvedValue(undefined),
  };
  const transactionalTherapistRepository = {
    create: jest.fn((value: Partial<Therapist>) => value as Therapist),
    save: jest.fn<(value: Therapist) => Promise<Therapist>>(),
  };
  const transactionalUserRepository = {
    create: jest.fn((value: Partial<User>) => value as User),
    save: jest.fn<(value: User) => Promise<User>>(),
    update: jest.fn(),
  };
  const dataSource = {
    transaction: jest.fn((callback: (manager: unknown) => unknown) =>
      Promise.resolve(
        callback({
          getRepository: (entity: unknown) =>
            entity === Therapist
              ? transactionalTherapistRepository
              : transactionalUserRepository,
        }),
      ),
    ),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    therapistQueryBuilder.addSelect.mockReturnThis();
    therapistQueryBuilder.leftJoinAndSelect.mockReturnThis();
    therapistQueryBuilder.where.mockReturnThis();
    therapistQueryBuilder.orderBy.mockReturnThis();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TherapistService,
        {
          provide: getRepositoryToken(Therapist),
          useValue: therapistRepository,
        },
        { provide: DataSource, useValue: dataSource },
        {
          provide: getRepositoryToken(Appointment),
          useValue: appointmentRepository,
        },
        {
          provide: getRepositoryToken(AvailabilitySlot),
          useValue: slotRepository,
        },
        {
          provide: UserService,
          useValue: userService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: NotificationService,
          useValue: notificationService,
        },
        {
          provide: ProviderJobService,
          useValue: providerJobService,
        },
        { provide: MediaService, useValue: mediaService },
      ],
    }).compile();

    service = module.get<TherapistService>(TherapistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('queues therapist credentials with the validated email when the saved entity hides it', async () => {
    userService.findByEmail.mockResolvedValue(null);
    transactionalUserRepository.save.mockImplementation((account: User) =>
      Promise.resolve({ ...account, id: 'account-1' }),
    );
    transactionalTherapistRepository.save.mockImplementation(
      (therapist: Therapist) => {
        const { email: _hiddenEmail, ...saved } = therapist;
        void _hiddenEmail;
        return Promise.resolve({ ...saved, id: 'therapist-1' } as Therapist);
      },
    );
    providerJobService.enqueueEmail.mockResolvedValue({ id: 'job-1' });
    notificationService.create.mockResolvedValue(undefined);

    const result = await service.create({
      email: ' Therapist@Example.com ',
    });

    expect(providerJobService.enqueueEmail).toHaveBeenCalledTimes(1);
    const firstEnqueueCall: unknown =
      providerJobService.enqueueEmail.mock.calls[0];
    const [queuedEmail, enqueueOptions] = firstEnqueueCall as [
      SendMailInput,
      { deduplicationKey?: string } | undefined,
    ];
    expect(queuedEmail.to).toBe('therapist@example.com');
    expect(queuedEmail.text).toContain('Email: therapist@example.com');
    expect(queuedEmail.html).toContain(
      '<strong>Email:</strong> therapist@example.com',
    );
    expect(enqueueOptions).toEqual({
      deduplicationKey: 'therapist:therapist-1:credentials',
    });
    expect(result.credentialsQueued).toBe(true);
  });

  it('keeps verified public therapists discoverable without bookable slots', async () => {
    const therapists = [
      {
        id: 'therapist-with-slot',
        name: 'With Slot',
        isActive: true,
        nextAvailableSlot: null,
      },
      {
        id: 'therapist-without-slot',
        name: 'Without Slot',
        isActive: true,
        nextAvailableSlot: null,
      },
    ];
    therapistRepository.find.mockResolvedValue(therapists);
    slotRepository.find.mockResolvedValue([
      {
        therapist: { id: 'therapist-with-slot' },
        startTime: new Date('2026-07-21T04:30:00Z'),
      },
    ]);

    const result = await service.findAll();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('therapist-with-slot');
    expect(result[0].nextAvailableSlot).toEqual(
      new Date('2026-07-21T04:30:00Z'),
    );
    expect(slotRepository.find).toHaveBeenCalledTimes(1);
  });

  it('returns only verified active public profile fields with current availability', async () => {
    therapistRepository.findOne.mockResolvedValue({
      id: 'therapist-1',
      name: 'Therapist One',
      email: 'private@example.com',
      title: 'Psychologist',
      tags: ['Anxiety'],
      experience: 120,
      group: 1,
      price: 1000,
      couplePrice: null,
      image: null,
      voiceIntro: null,
      qualifications: 'MSc Psychology',
      awardingInstitution: 'Example University',
      verifiedExperienceHours: null,
      professionalRegistrationNumber: null,
      registrationAuthority: null,
      specialization: 'Anxiety',
      consultationType: 'Video',
      sessionDurationMinutes: 60,
      engagementRelationship: 'Independent professional',
      verificationStatus: TherapistVerificationStatus.VERIFIED,
      bio: 'Profile',
      pendingProfileChanges: { bio: 'Unpublished profile' },
      pendingProfileSubmittedAt: new Date(),
      nextAvailableSlot: null,
      isActive: true,
      createdAt: new Date('2026-07-19T00:00:00Z'),
    });
    slotRepository.find.mockResolvedValue([
      {
        therapist: { id: 'therapist-1' },
        startTime: new Date('2026-07-22T04:30:00Z'),
      },
    ]);

    const result = await service.findOne('therapist-1');

    expect(therapistRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 'therapist-1',
        isActive: true,
        verificationStatus: TherapistVerificationStatus.VERIFIED,
        archivedAt: IsNull(),
      },
    });
    expect(result.nextAvailableSlot).toEqual(new Date('2026-07-22T04:30:00Z'));
    expect(result).not.toHaveProperty('email');
    expect(result).not.toHaveProperty('pendingProfileChanges');
    expect(result.professionalRegistrationNumber).toBeNull();
    expect(result.registrationAuthority).toBeNull();
    expect(result.sessionDurationMinutes).toBe(60);
    expect(result.engagementRelationship).toBe('Independent professional');
    expect(result.verificationStatus).toBe(
      TherapistVerificationStatus.VERIFIED,
    );
  });

  it('does not merge pending profile changes while publishing', async () => {
    const therapist = {
      id: 'therapist-1',
      name: '',
      title: '',
      qualifications: null,
      awardingInstitution: null,
      tags: null,
      experience: 2,
      price: 0,
      consultationType: null,
      verificationStatus: TherapistVerificationStatus.VERIFIED,
      isActive: false,
      account: null,
      pendingProfileChanges: {
        name: 'Practitioner One',
        title: 'Clinical Psychologist',
        qualifications: 'MSc Psychology',
        awardingInstitution: 'University of Kerala',
        tags: ['Anxiety'],
        price: 1000,
        consultationType: 'Video',
      },
      pendingProfileSubmittedAt: new Date('2026-08-23T00:00:00Z'),
    };
    therapistQueryBuilder.getOne.mockResolvedValue(therapist);

    await expect(
      service.update('therapist-1', { isActive: true }),
    ).rejects.toThrow(
      'Review or reject the pending profile changes before publishing',
    );
    expect(transactionalTherapistRepository.save).not.toHaveBeenCalled();
  });

  it('reports every missing publication requirement', async () => {
    therapistQueryBuilder.getOne.mockResolvedValue({
      id: 'therapist-1',
      name: '',
      title: '',
      qualifications: null,
      awardingInstitution: null,
      tags: null,
      price: 0,
      consultationType: null,
      verificationStatus: TherapistVerificationStatus.VERIFIED,
      isActive: false,
      account: null,
      pendingProfileChanges: null,
    });

    await expect(
      service.update('therapist-1', { isActive: true }),
    ).rejects.toThrow(
      'Complete these practitioner profile fields before publishing: full name, exact professional role, qualifications, awarding institution, areas of practice, languages, consultation type, session duration, verified experience hours, engagement relationship, consultation price',
    );
    expect(transactionalTherapistRepository.save).not.toHaveBeenCalled();
  });

  it('keeps an approved inactive profile pending until credentials are verified', async () => {
    const therapist = {
      id: 'therapist-1',
      name: 'Practitioner One',
      verificationStatus: TherapistVerificationStatus.PENDING,
      isActive: false,
      account: null,
      pendingProfileChanges: { bio: 'Reviewed profile' },
      pendingProfileSubmittedAt: new Date('2026-08-23T00:00:00Z'),
    };
    therapistQueryBuilder.getOne.mockResolvedValue(therapist);
    therapistRepository.save.mockImplementation((value) =>
      Promise.resolve(value),
    );

    const result = await service.approveProfileChanges('therapist-1');

    expect(result.verificationStatus).toBe(TherapistVerificationStatus.PENDING);
    expect(result.pendingProfileChanges).toBeNull();
  });

  it('marks an inactive profile rejected when its submitted changes are rejected', async () => {
    const therapist = {
      id: 'therapist-1',
      name: 'Practitioner One',
      verificationStatus: TherapistVerificationStatus.PENDING,
      isActive: false,
      account: null,
      pendingProfileChanges: { bio: 'Unapproved profile' },
      pendingProfileSubmittedAt: new Date('2026-08-23T00:00:00Z'),
    };
    therapistQueryBuilder.getOne.mockResolvedValue(therapist);
    therapistRepository.save.mockImplementation((value) =>
      Promise.resolve(value),
    );

    const result = await service.rejectProfileChanges('therapist-1');

    expect(result.verificationStatus).toBe(
      TherapistVerificationStatus.REJECTED,
    );
    expect(result.pendingProfileChanges).toBeNull();
  });
});
