import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '../../user/entities/user.entity';
import { UserService } from '../../user/user.service';
import { readSessionCookie } from '../session-cookie';

export type JwtPayload = {
  userId: string;
  email: string;
  role: Role;
  mustChangePassword: boolean;
};

/** Claims inside a signed access token. `tv` is the account's token version. */
export type AccessTokenClaims = Partial<JwtPayload> & { tv?: number };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      // The browser sends the httpOnly session cookie. A Bearer header is
      // still accepted for API clients and automated tests.
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => readSessionCookie(req),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'dev-jwt-secret'),
    });
  }

  async validate(payload: AccessTokenClaims) {
    if (!payload.userId) {
      throw new UnauthorizedException('Invalid access token');
    }
    const account = await this.userService.findForSession(payload.userId);
    if (!account || account.disabledAt || account.anonymizedAt) {
      throw new UnauthorizedException('Account is unavailable');
    }
    // Tokens issued before the password last changed are no longer valid.
    if ((payload.tv ?? 0) !== (account.tokenVersion ?? 0)) {
      throw new UnauthorizedException(
        'Your session has ended. Please sign in again.',
      );
    }
    return {
      userId: account.id,
      email: account.email,
      role: account.role,
      mustChangePassword: account.mustChangePassword,
    };
  }
}
