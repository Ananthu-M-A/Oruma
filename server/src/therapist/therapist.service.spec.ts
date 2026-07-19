import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Appointment } from '../appointment/entities/appointment.entity';
import { AvailabilitySlot } from '../availability/entities/availability-slot.entity';
import { MailService } from '../mail/mail.service';
import { NotificationService } from '../notification/notification.service';
import { UserService } from '../user/user.service';
import { Therapist } from './entities/therapist.entity';
import { TherapistService } from './therapist.service';

describe('TherapistService', () => {
  let service: TherapistService;
  const therapistRepository = {
    find: jest.fn(),
  };
  const appointmentRepository = {
    find: jest.fn(),
  };
  const slotRepository = {
    findOne: jest.fn(),
  };
  const userService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    updateEmail: jest.fn(),
    remove: jest.fn(),
  };
  const mailService = {
    send: jest.fn(),
  };
  const configService = {
    get: jest.fn(),
  };
  const notificationService = {
    create: jest.fn(),
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
          provide: MailService,
          useValue: mailService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: NotificationService,
          useValue: notificationService,
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
    slotRepository.findOne
      .mockResolvedValueOnce({ startTime: new Date('2026-07-21T04:30:00Z') })
      .mockResolvedValueOnce(null);

    const result = await service.findAll();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('therapist-with-slot');
    expect(result[0].nextAvailableSlot).toEqual(
      new Date('2026-07-21T04:30:00Z'),
    );
  });
});
