import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
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
  constructor(private readonly authService: AuthService) {}

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
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('login/otp/request')
  requestLoginOtp(@Body() dto: RequestLoginOtpDto) {
    return this.authService.requestLoginOtp(dto);
  }

  @Post('login/otp/verify')
  verifyLoginOtp(@Body() dto: VerifyLoginOtpDto) {
    return this.authService.verifyLoginOtp(dto);
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
}
