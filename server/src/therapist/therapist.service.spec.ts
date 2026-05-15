import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Appointment } from '../appointment/entities/appointment.entity';
import { MailService } from '../mail/mail.service';
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

  beforeEach(async () => {
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
      ],
    }).compile();

    service = module.get<TherapistService>(TherapistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
