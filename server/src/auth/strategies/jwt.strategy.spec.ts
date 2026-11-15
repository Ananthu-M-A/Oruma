import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { Role } from '../../user/entities/user.entity';

describe('JwtStrategy', () => {
  const config = { get: jest.fn().mockReturnValue('test-jwt-secret') };
  const account = {
    id: 'user-1',
    email: 'current@oruma.test',
    role: Role.PATIENT,
    disabledAt: null,
    anonymizedAt: null,
    mustChangePassword: false,
    tokenVersion: 0,
  };

  it('rejects a booking-verification token used as an access token', async () => {
    const users = { findForSession: jest.fn() };
    const strategy = new JwtStrategy(config as never, users as never);

    await expect(strategy.validate({})).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(users.findForSession).not.toHaveBeenCalled();
  });

  it('uses the current account role instead of stale token claims', async () => {
    const users = { findForSession: jest.fn().mockResolvedValue(account) };
    const strategy = new JwtStrategy(config as never, users as never);

    await expect(
      strategy.validate({
        userId: 'user-1',
        email: 'old@oruma.test',
        role: Role.ADMIN,
      }),
    ).resolves.toEqual({
      userId: 'user-1',
      email: 'current@oruma.test',
      role: Role.PATIENT,
      mustChangePassword: false,
    });
  });

  it('rejects a token issued before the password changed', async () => {
    const users = {
      findForSession: jest
        .fn()
        .mockResolvedValue({ ...account, tokenVersion: 1 }),
    };
    const strategy = new JwtStrategy(config as never, users as never);

    await expect(
      strategy.validate({ userId: 'user-1', tv: 0 }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      strategy.validate({ userId: 'user-1', tv: 1 }),
    ).resolves.toEqual(expect.objectContaining({ userId: 'user-1' }));
  });

  it('reads the access token from the session cookie', () => {
    const strategy = new JwtStrategy(config as never, {} as never);
    const extractor = (
      strategy as unknown as {
        _jwtFromRequest: (req: unknown) => string | null;
      }
    )._jwtFromRequest;
    expect(
      extractor({ headers: { cookie: 'other=1; oruma_session=abc.def.ghi' } }),
    ).toBe('abc.def.ghi');
    expect(
      extractor({ headers: { authorization: 'Bearer from.header.token' } }),
    ).toBe('from.header.token');
  });
});
