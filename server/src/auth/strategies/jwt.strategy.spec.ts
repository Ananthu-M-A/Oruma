import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { Role } from '../../user/entities/user.entity';

describe('JwtStrategy', () => {
  const config = { get: jest.fn().mockReturnValue('test-jwt-secret') };

  it('rejects a booking-verification token used as an access token', async () => {
    const users = { findById: jest.fn() };
    const strategy = new JwtStrategy(config as never, users as never);

    await expect(strategy.validate({})).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(users.findById).not.toHaveBeenCalled();
  });

  it('uses the current account role instead of stale token claims', async () => {
    const users = {
      findById: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'current@oruma.test',
        role: Role.PATIENT,
        disabledAt: null,
        anonymizedAt: null,
      }),
    };
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
    });
  });
});
