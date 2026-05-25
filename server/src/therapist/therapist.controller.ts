import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';

import { TherapistService } from './therapist.service';

import { CreateTherapistDto } from './dto/create-therapist.dto';

import { UpdateTherapistDto } from './dto/update-therapist.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../user/entities/user.entity';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

type AuthenticatedRequest = {
  user: JwtPayload;
};

@Controller('therapists')
export class TherapistController {
  constructor(private readonly therapistService: TherapistService) {}

  // PUBLIC
  @Get()
  findAll() {
    return this.therapistService.findAll();
  }

  // ADMIN ONLY
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAllForAdmin() {
    return this.therapistService.findAllForAdmin();
  }

  // ADMIN ONLY
  @Get('admin/performance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getPerformance() {
    return this.therapistService.getPerformance();
  }

  // THERAPIST ONLY
  @Get('me/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.THERAPIST)
  findOwnProfile(@Req() req: AuthenticatedRequest) {
    return this.therapistService.findForTherapistAccount(req.user);
  }

  // THERAPIST ONLY
  @Patch('me/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.THERAPIST)
  updateOwnProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateTherapistDto,
  ) {
    return this.therapistService.updateOwnProfile(req.user, dto);
  }

  // ADMIN ONLY
  @Patch(':id/profile-changes/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  approveProfileChanges(@Param('id') id: string) {
    return this.therapistService.approveProfileChanges(id);
  }

  // ADMIN ONLY
  @Patch(':id/profile-changes/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  rejectProfileChanges(@Param('id') id: string) {
    return this.therapistService.rejectProfileChanges(id);
  }

  // PUBLIC
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.therapistService.findOne(id);
  }

  // ADMIN ONLY
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateTherapistDto) {
    return this.therapistService.create(dto);
  }

  // ADMIN ONLY
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,

    @Body() dto: UpdateTherapistDto,
  ) {
    return this.therapistService.update(id, dto);
  }

  // ADMIN ONLY
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.therapistService.remove(id);
  }
}
