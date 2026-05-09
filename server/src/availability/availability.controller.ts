import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';

import { AvailabilityService } from './availability.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../user/entities/user.entity';

import { CreateAvailabilitySlotDto } from './dto/create-availability-slot.dto';
import { BulkCreateAvailabilityDto } from './dto/bulk-create-availability.dto';

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

  @Get(':therapistId')
  getAvailableSlots(@Param('therapistId') therapistId: string) {
    return this.availabilityService.getAvailableSlots(therapistId);
  }

  @Delete(':slotId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.THERAPIST)
  delete(@Param('slotId') slotId: string) {
    return this.availabilityService.delete(slotId);
  }
}
