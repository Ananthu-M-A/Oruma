import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService, AuthenticatedUser } from './auth.service';
import { clearSessionCookie, setSessionCookie } from './session-cookie';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestLoginOtpDto } from './dto/request-login-otp.dto';
import { VerifyLoginOtpDto } from './dto/verify-login-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from '../user/entities/user.entity';
import { JwtPayload } from './strategies/jwt.strategy';

type AuthenticatedRequest = {
  user: JwtPayload;
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: AuthenticatedRequest) {
    return req.user;
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getAdminProfile(@Req() req: AuthenticatedRequest) {
    return req.user;
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.startSession(res, await this.authService.login(dto));
  }

  /** Ends the browser session by clearing the httpOnly cookie. */
  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response) {
    clearSessionCookie(res, this.configService);
  }

  @Post('login/otp/request')
  requestLoginOtp(@Body() dto: RequestLoginOtpDto) {
    return this.authService.requestLoginOtp(dto);
  }

  @Post('login/otp/verify')
  async verifyLoginOtp(
    @Body() dto: VerifyLoginOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.startSession(res, await this.authService.verifyLoginOtp(dto));
  }

  @Post('booking/otp/request')
  requestBookingOtp(@Body() dto: RequestLoginOtpDto) {
    return this.authService.requestQuickBookingOtp(dto);
  }

  @Post('booking/otp/verify')
  verifyBookingOtp(@Body() dto: VerifyLoginOtpDto) {
    return this.authService.verifyQuickBookingOtp(dto);
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * Puts the token in the httpOnly cookie and leaves it out of the response
   * body, so browser scripts never see it.
   */
  private startSession(res: Response, session: AuthenticatedUser) {
    setSessionCookie(
      res,
      session.accessToken,
      session.expiresAt,
      this.configService,
    );
    return { user: session.user, expiresAt: session.expiresAt.toISOString() };
  }
}
