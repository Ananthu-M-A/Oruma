import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { Role, User } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RequestLoginOtpDto } from './dto/request-login-otp.dto';
import { VerifyLoginOtpDto } from './dto/verify-login-otp.dto';
import { LoginOtp } from './entities/login-otp.entity';
import { MailService } from '../mail/mail.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

type RegisteredUser = Pick<User, 'id' | 'email' | 'role' | 'createdAt'>;
type AuthenticatedUser = {
  accessToken: string;
  user: Pick<User, 'id' | 'email' | 'role' | 'createdAt'>;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly whatsAppService: WhatsAppService,
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
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async login(dto: LoginDto): Promise<AuthenticatedUser> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.userService.findByEmail(email);

    if (!user) {
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
    const normalized = this.normalizeIdentifier(dto.identifier);
    const user = await this.userService.findPatientByEmailOrPhone(normalized);

    if (!user) {
      return {
        message:
          'If a patient account exists for this contact, a login code has been sent.',
      };
    }

    const code = String(randomInt(100000, 1000000));
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.loginOtpRepository.update(
      { identifier: normalized, used: false },
      { used: true },
    );

    await this.loginOtpRepository.save(
      this.loginOtpRepository.create({
        identifier: normalized,
        codeHash,
        expiresAt,
      }),
    );

    const message = `Your Oruma login code is ${code}. It expires in 10 minutes.`;

    if (this.isEmail(normalized)) {
      await this.mailService.send({
        to: normalized,
        subject: 'Your Oruma login code',
        text: message,
        html: `<p>${message}</p>`,
      });
    } else {
      const otpTemplateName = this.configService.get<string>(
        'WHATSAPP_OTP_TEMPLATE_NAME',
      );

      await this.whatsAppService.send({
        to: normalized,
        text: message,
        ...(otpTemplateName
          ? {
              templateName: otpTemplateName,
              templateParameters: [code],
            }
          : {}),
      });
    }

    return {
      message:
        'If a patient account exists for this contact, a login code has been sent.',
      ...(this.configService.get<string>('NODE_ENV') === 'production'
        ? {}
        : { devCode: code }),
    };
  }

  async verifyLoginOtp(dto: VerifyLoginOtpDto): Promise<AuthenticatedUser> {
    const normalized = this.normalizeIdentifier(dto.identifier);
    const loginOtp = await this.loginOtpRepository.findOne({
      where: {
        identifier: normalized,
        used: false,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!loginOtp || loginOtp.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Invalid or expired login code');
    }

    const isMatch = await bcrypt.compare(dto.code, loginOtp.codeHash);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid or expired login code');
    }

    const user = await this.userService.findPatientByEmailOrPhone(normalized);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired login code');
    }

    loginOtp.used = true;
    await this.loginOtpRepository.save(loginOtp);

    return this.createAuthResponse(user);
  }

  private createAuthResponse(user: User): AuthenticatedUser {
    const accessToken = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
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
