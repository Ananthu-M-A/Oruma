import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMe(@Req() req: { user: JwtPayload }) {
    return this.userService.findById(req.user.userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(
    @Req() req: { user: JwtPayload },
    @Body()
    body: {
      fullName?: string;
      phone?: string;
      age?: number;
      gender?: string;
      healthInfo?: Record<string, unknown> | null;
    },
  ) {
    return this.userService.updateProfile(req.user.userId, {
      fullName: body.fullName?.trim() || null,
      phone: body.phone?.trim() || null,
      age: body.age ? Number(body.age) : null,
      gender: body.gender?.trim() || null,
      healthInfo: body.healthInfo ?? null,
    });
  }
}
