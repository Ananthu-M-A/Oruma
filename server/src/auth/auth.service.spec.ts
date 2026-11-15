import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { LoginOtp } from './entities/login-otp.entity';
import { ProviderJobService } from '../reliability/provider-job.service';

describe('AuthService', () => {
  let service: AuthService;
  const userService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findPatientByEmailOrPhone: jest.fn(),
  };
  const jwtService = {
    sign: jest.fn(),
  };
  const configService = {
    get: jest.fn(),
  };
  const providerJobService = {
    enqueueEmail: jest.fn(),
  };
  const loginOtpRepository = {
    update: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: userService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: ProviderJobService,
          useValue: providerJobService,
        },
        {
          provide: getRepositoryToken(LoginOtp),
          useValue: loginOtpRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('requestQuickBookingOtp', () => {
    let env: Record<string, string | undefined>;

    beforeEach(() => {
      jest.clearAllMocks();
      env = {};
      configService.get.mockImplementation((key: string) => env[key]);
      loginOtpRepository.count.mockResolvedValue(0);
      loginOtpRepository.create.mockImplementation((value: unknown) => value);
      loginOtpRepository.save.mockResolvedValue({ id: 'otp-1' });
    });

    it('refuses more codes once the hourly limit for an email is reached', async () => {
      loginOtpRepository.count.mockResolvedValueOnce(5);
      await expect(
        service.requestQuickBookingOtp({ identifier: 'a@example.com' }),
      ).rejects.toMatchObject({ status: 429 });
      expect(providerJobService.enqueueEmail).not.toHaveBeenCalled();
    });

    it('refuses a second code inside the resend cooldown', async () => {
      loginOtpRepository.count
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(1);
      await expect(
        service.requestQuickBookingOtp({ identifier: 'a@example.com' }),
      ).rejects.toMatchObject({ status: 429 });
      expect(providerJobService.enqueueEmail).not.toHaveBeenCalled();
    });

    it('omits the code from the response unless explicitly enabled', async () => {
      env.NODE_ENV = 'development';
      const result = await service.requestQuickBookingOtp({
        identifier: 'a@example.com',
      });
      expect(result.devCode).toBeUndefined();
    });

    it('returns the code only with OTP_DEV_CODE_ENABLED outside production', async () => {
      env.NODE_ENV = 'development';
      env.OTP_DEV_CODE_ENABLED = 'true';
      const devResult = await service.requestQuickBookingOtp({
        identifier: 'a@example.com',
      });
      expect(devResult.devCode).toMatch(/^\d{6}$/);

      env.NODE_ENV = 'production';
      const prodResult = await service.requestQuickBookingOtp({
        identifier: 'b@example.com',
      });
      expect(prodResult.devCode).toBeUndefined();
    });
  });
});
