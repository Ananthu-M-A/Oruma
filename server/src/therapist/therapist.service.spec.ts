import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Appointment } from '../appointment/entities/appointment.entity';
import { AvailabilitySlot } from '../availability/entities/availability-slot.entity';
import { NotificationService } from '../notification/notification.service';
import { UserService } from '../user/user.service';
import { Therapist } from './entities/therapist.entity';
import { TherapistService } from './therapist.service';
import { ProviderJobService } from '../reliability/provider-job.service';

describe('TherapistService', () => {
  let service: TherapistService;
  const therapistRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
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
    enqueueEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TherapistService,
        {
          provide: getRepositoryToken(Therapist),
          useValue: therapistRepository,
        },
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
      ],
    }).compile();

    service = module.get<TherapistService>(TherapistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('omits public therapists without bookable slots', async () => {
    const therapists = [
      { id: 'therapist-with-slot', isActive: true, nextAvailableSlot: null },
      { id: 'therapist-without-slot', isActive: true, nextAvailableSlot: null },
    ];
    therapistRepository.find.mockResolvedValue(therapists);
    slotRepository.find.mockResolvedValue([
      {
        therapist: { id: 'therapist-with-slot' },
        startTime: new Date('2026-07-21T04:30:00Z'),
      },
    ]);

    const result = await service.findAll();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('therapist-with-slot');
    expect(result[0].nextAvailableSlot).toEqual(
      new Date('2026-07-21T04:30:00Z'),
    );
    expect(slotRepository.find).toHaveBeenCalledTimes(1);
  });

  it('returns only active public profile fields with current availability', async () => {
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
      specialization: 'Anxiety',
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
        archivedAt: IsNull(),
      },
    });
    expect(result.nextAvailableSlot).toEqual(new Date('2026-07-22T04:30:00Z'));
    expect(result).not.toHaveProperty('email');
    expect(result).not.toHaveProperty('pendingProfileChanges');
  });
});
