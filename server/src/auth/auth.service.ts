import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { MoreThan, Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { Role, User } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RequestLoginOtpDto } from './dto/request-login-otp.dto';
import { VerifyLoginOtpDto } from './dto/verify-login-otp.dto';
import { LoginOtp } from './entities/login-otp.entity';
import { ProviderJobService } from '../reliability/provider-job.service';

type RegisteredUser = Pick<
  User,
  'id' | 'email' | 'role' | 'createdAt' | 'mustChangePassword'
>;
type AuthenticatedUser = {
  accessToken: string;
  user: Pick<
    User,
    'id' | 'email' | 'role' | 'createdAt' | 'mustChangePassword'
  >;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly providerJobService: ProviderJobService,
    @InjectRepository(LoginOtp)
    private readonly loginOtpRepository: Repository<LoginOtp>,
  ) {}

  async register(dto: RegisterDto): Promise<RegisteredUser> {
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.userService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userService.create({
      email,
      password: hashedPassword,
      role: Role.PATIENT,
      fullName: dto.fullName?.trim() || null,
      phone: dto.phone?.trim() || null,
      age: dto.age ?? null,
      gender: dto.gender?.trim() || null,
      healthInfo: dto.healthInfo ?? null,
      mustChangePassword: false,
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      mustChangePassword: user.mustChangePassword,
    };
  }

  async login(dto: LoginDto): Promise<AuthenticatedUser> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.userService.findByEmail(email);

    if (!user || user.disabledAt || user.anonymizedAt) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createAuthResponse(user);
  }

  async requestLoginOtp(dto: RequestLoginOtpDto): Promise<{
    message: string;
    devCode?: string;
  }> {
    return this.requestOtp(dto, 'LOGIN', true);
  }

  async verifyLoginOtp(dto: VerifyLoginOtpDto): Promise<AuthenticatedUser> {
    const normalized = this.normalizeIdentifier(dto.identifier);
    await this.verifyOtp(normalized, dto.code, 'LOGIN');

    const user = await this.userService.findPatientByEmailOrPhone(normalized);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired login code');
    }

    return this.createAuthResponse(user);
  }

  requestQuickBookingOtp(dto: RequestLoginOtpDto) {
    return this.requestOtp(dto, 'QUICK_BOOKING', false);
  }

  async verifyQuickBookingOtp(dto: VerifyLoginOtpDto) {
    const identifier = this.normalizeIdentifier(dto.identifier);
    await this.verifyOtp(identifier, dto.code, 'QUICK_BOOKING');
    return {
      verificationToken: this.jwtService.sign(
        { purpose: 'QUICK_BOOKING', identifier },
        { expiresIn: '10m' },
      ),
      expiresInSeconds: 600,
    };
  }

  verifyQuickBookingToken(token: string) {
    try {
      const payload = this.jwtService.verify<{
        purpose: string;
        identifier: string;
      }>(token);
      if (payload.purpose !== 'QUICK_BOOKING' || !payload.identifier) {
        throw new Error('Invalid purpose');
      }
      return payload.identifier;
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired booking verification',
      );
    }
  }

  private async requestOtp(
    dto: RequestLoginOtpDto,
    purpose: 'LOGIN' | 'QUICK_BOOKING',
    requireAccount: boolean,
  ): Promise<{ message: string; devCode?: string }> {
    const normalized = this.normalizeIdentifier(dto.identifier);
    if (!this.isEmail(normalized)) {
      throw new BadRequestException(
        'Use your email for verification. Booking updates are sent by email and shown in the patient dashboard.',
      );
    }
    if (requireAccount) {
      const user = await this.userService.findPatientByEmailOrPhone(normalized);
      if (!user)
        return {
          message: 'If an eligible account exists, a code has been sent.',
        };
    }
    await this.assertOtpRequestAllowed(normalized);
    const code = String(randomInt(100000, 1000000));
    await this.loginOtpRepository.update(
      { identifier: normalized, purpose, used: false },
      { used: true },
    );
    const saved = await this.loginOtpRepository.save(
      this.loginOtpRepository.create({
        identifier: normalized,
        purpose,
        codeHash: await bcrypt.hash(code, 10),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        failedAttempts: 0,
      }),
    );
    const label = purpose === 'LOGIN' ? 'login' : 'booking verification';
    const message = `Your Oruma ${label} code is ${code}. It expires in 10 minutes.`;
    await this.providerJobService.enqueueEmail(
      {
        to: normalized,
        subject: `Your Oruma ${label} code`,
        text: message,
        html: `<p>${message}</p>`,
      },
      { deduplicationKey: `otp:${saved.id}:email` },
    );
    return {
      message: 'If the contact is eligible, a code has been sent.',
      ...(this.isDevCodeEnabled() ? { devCode: code } : {}),
    };
  }

  /**
   * Codes go out by email, so cap them per address as well as per IP.
   * Without this, anyone could use the booking code form to send repeated
   * emails to a stranger's inbox and spend the Resend quota.
   */
  private async assertOtpRequestAllowed(identifier: string) {
    const now = Date.now();
    const maxPerHour = this.readPositiveInt('OTP_MAX_REQUESTS_PER_HOUR', 5);
    const cooldownSeconds = this.readPositiveInt(
      'OTP_RESEND_COOLDOWN_SECONDS',
      60,
    );
    const recentCount = await this.loginOtpRepository.count({
      where: {
        identifier,
        createdAt: MoreThan(new Date(now - 60 * 60 * 1000)),
      },
    });
    if (recentCount >= maxPerHour) {
      throw new HttpException(
        'Too many codes requested for this email. Please try again in an hour.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    const lastCodeCount = await this.loginOtpRepository.count({
      where: {
        identifier,
        createdAt: MoreThan(new Date(now - cooldownSeconds * 1000)),
      },
    });
    if (lastCodeCount > 0) {
      throw new HttpException(
        `Please wait ${cooldownSeconds} seconds before requesting another code.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  /** Returning the code in the response is an explicit development opt-in. */
  private isDevCodeEnabled() {
    return (
      this.configService.get<string>('NODE_ENV') !== 'production' &&
      this.configService.get<string>('OTP_DEV_CODE_ENABLED') === 'true'
    );
  }

  private readPositiveInt(key: string, fallback: number) {
    const value = Number(this.configService.get<string>(key));
    return Number.isInteger(value) && value > 0 ? value : fallback;
  }

  private async verifyOtp(
    identifier: string,
    code: string,
    purpose: 'LOGIN' | 'QUICK_BOOKING',
  ) {
    if (!this.isEmail(identifier)) {
      throw new BadRequestException('Email verification is required');
    }
    const otp = await this.loginOtpRepository.findOne({
      where: { identifier, purpose, used: false },
      order: { createdAt: 'DESC' },
    });
    if (
      !otp ||
      otp.expiresAt.getTime() < Date.now() ||
      otp.failedAttempts >= 5
    ) {
      throw new UnauthorizedException('Invalid or expired code');
    }
    if (!(await bcrypt.compare(code, otp.codeHash))) {
      otp.failedAttempts += 1;
      if (otp.failedAttempts >= 5) otp.used = true;
      await this.loginOtpRepository.save(otp);
      throw new UnauthorizedException('Invalid or expired code');
    }
    otp.used = true;
    await this.loginOtpRepository.save(otp);
  }

  private createAuthResponse(user: User): AuthenticatedUser {
    const accessToken = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        mustChangePassword: user.mustChangePassword,
      },
    };
  }

  private normalizeIdentifier(identifier: string) {
    const trimmed = identifier.trim().toLowerCase();

    if (this.isEmail(trimmed)) return trimmed;

    return trimmed.replace(/\D/g, '');
  }

  private isEmail(value: string) {
    return value.includes('@');
  }
}
