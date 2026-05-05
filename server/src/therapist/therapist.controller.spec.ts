import { Test, TestingModule } from '@nestjs/testing';
import { TherapistController } from './therapist.controller';
import { TherapistService } from './therapist.service';

describe('TherapistController', () => {
  let controller: TherapistController;
  const therapistService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TherapistController],
      providers: [
        {
          provide: TherapistService,
          useValue: therapistService,
        },
      ],
    }).compile();

    controller = module.get<TherapistController>(TherapistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
