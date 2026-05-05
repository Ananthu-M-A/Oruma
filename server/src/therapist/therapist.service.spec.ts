import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Therapist } from './entities/therapist.entity';
import { TherapistService } from './therapist.service';

describe('TherapistService', () => {
  let service: TherapistService;
  const therapistRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TherapistService,
        {
          provide: getRepositoryToken(Therapist),
          useValue: therapistRepository,
        },
      ],
    }).compile();

    service = module.get<TherapistService>(TherapistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
