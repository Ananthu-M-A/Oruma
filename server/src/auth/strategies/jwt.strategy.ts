import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '../../user/entities/user.entity';
import { UserService } from '../../user/user.service';

export type JwtPayload = {
  userId: string;
  email: string;
  role: Role;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'dev-jwt-secret'),
    });
  }

  async validate(payload: Partial<JwtPayload>) {
    if (!payload.userId) {
      throw new UnauthorizedException('Invalid access token');
    }
    const account = await this.userService.findById(payload.userId);
    if (!account || account.disabledAt || account.anonymizedAt) {
      throw new UnauthorizedException('Account is unavailable');
    }
    return {
      userId: account.id,
      email: account.email,
      role: account.role,
    };
  }
}
