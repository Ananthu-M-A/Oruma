import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Patch,
  Req,
} from '@nestjs/common';

import { AvailabilityService } from './availability.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../user/entities/user.entity';

import { CreateAvailabilitySlotDto } from './dto/create-availability-slot.dto';
import { BulkCreateAvailabilityDto } from './dto/bulk-create-availability.dto';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateOwnAvailabilitySlotDto } from './dto/create-own-availability-slot.dto';
import { UpdateAvailabilitySlotDto } from './dto/update-availability-slot.dto';

type AuthenticatedRequest = {
  user: JwtPayload;
};

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.THERAPIST)
  create(@Body() dto: CreateAvailabilitySlotDto) {
    return this.availabilityService.create(dto);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.THERAPIST)
  bulkCreate(@Body() dto: BulkCreateAvailabilityDto) {
    return this.availabilityService.bulkCreate(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.THERAPIST)
  getOwnSlots(@Req() req: AuthenticatedRequest) {
    return this.availabilityService.getOwnSlots(req.user);
  }

  @Post('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.THERAPIST)
  createOwn(
    @Body() dto: CreateOwnAvailabilitySlotDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.availabilityService.createOwn(dto, req.user);
  }

  @Patch(':slotId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.THERAPIST)
  updateOwn(
    @Param('slotId') slotId: string,
    @Body() dto: UpdateAvailabilitySlotDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.availabilityService.update(slotId, dto, req.user);
  }

  @Get(':therapistId')
  getAvailableSlots(@Param('therapistId') therapistId: string) {
    return this.availabilityService.getAvailableSlots(therapistId);
  }

  @Delete(':slotId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.THERAPIST)
  delete(@Param('slotId') slotId: string, @Req() req: AuthenticatedRequest) {
    return this.availabilityService.delete(
      slotId,
      req.user.role === Role.THERAPIST ? req.user : undefined,
    );
  }
}
