import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Role } from '../user/entities/user.entity';
import { CreatePrivacyRequestDto } from './dto/create-privacy-request.dto';
import { ReviewPrivacyRequestDto } from './dto/review-privacy-request.dto';
import { PrivacyService } from './privacy.service';

@Controller('privacy')
@UseGuards(JwtAuthGuard)
export class PrivacyController {
  constructor(private readonly service: PrivacyService) {}
  @Get('me/export') exportMine(@Req() req: { user: JwtPayload }) {
    return this.service.exportMyData(req.user);
  }
  @Get('me/requests') findMine(@Req() req: { user: JwtPayload }) {
    return this.service.findMine(req.user);
  }
  @Post('me/requests') create(
    @Req() req: { user: JwtPayload },
    @Body() dto: CreatePrivacyRequestDto,
  ) {
    return this.service.create(req.user, dto);
  }
  @Get('admin/requests') @UseGuards(RolesGuard) @Roles(Role.ADMIN) findAll() {
    return this.service.findAll();
  }
  @Patch('admin/requests/:id') @UseGuards(RolesGuard) @Roles(Role.ADMIN) review(
    @Param('id') id: string,
    @Body() dto: ReviewPrivacyRequestDto,
  ) {
    return this.service.review(id, dto);
  }
  @Post('admin/requests/:id/execute')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  execute(@Param('id') id: string) {
    return this.service.executeErasure(id);
  }
}
