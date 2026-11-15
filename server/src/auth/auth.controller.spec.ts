import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SESSION_COOKIE_NAME } from './session-cookie';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    login: jest.fn(),
    requestLoginOtp: jest.fn(),
    verifyLoginOtp: jest.fn(),
    register: jest.fn(),
  };
  const env: Record<string, string | undefined> = {};
  const configService = { get: jest.fn((key: string) => env[key]) };

  beforeEach(async () => {
    jest.clearAllMocks();
    for (const key of Object.keys(env)) delete env[key];
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('puts the token in an httpOnly cookie and keeps it out of the body', async () => {
    env.NODE_ENV = 'production';
    const expiresAt = new Date('2030-01-01T00:00:00Z');
    const user = { id: 'user-1', email: 'a@example.com', role: 'PATIENT' };
    authService.login.mockResolvedValue({
      accessToken: 'signed.jwt.token',
      expiresAt,
      user,
    });
    const res = { cookie: jest.fn(), clearCookie: jest.fn() };

    const body = await controller.login(
      { email: 'a@example.com', password: 'Password123!' },
      res as never,
    );

    expect(body).toEqual({ user, expiresAt: expiresAt.toISOString() });
    expect(body).not.toHaveProperty('accessToken');
    expect(res.cookie).toHaveBeenCalledWith(
      SESSION_COOKIE_NAME,
      'signed.jwt.token',
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        expires: expiresAt,
      }),
    );
  });

  it('clears the session cookie on logout', () => {
    const res = { cookie: jest.fn(), clearCookie: jest.fn() };
    controller.logout(res as never);
    expect(res.clearCookie).toHaveBeenCalledWith(
      SESSION_COOKIE_NAME,
      expect.objectContaining({ httpOnly: true, path: '/' }),
    );
  });
});
