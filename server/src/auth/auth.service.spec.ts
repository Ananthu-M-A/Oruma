import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { LoginOtp } from './entities/login-otp.entity';

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
  const mailService = {
    send: jest.fn(),
  };
  const whatsAppService = {
    send: jest.fn(),
  };
  const loginOtpRepository = {
    update: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
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
          provide: MailService,
          useValue: mailService,
        },
        {
          provide: WhatsAppService,
          useValue: whatsAppService,
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
});
