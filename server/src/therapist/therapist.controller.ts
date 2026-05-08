import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';

import { TherapistService } from './therapist.service';

import { CreateTherapistDto } from './dto/create-therapist.dto';

import { UpdateTherapistDto } from './dto/update-therapist.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../user/entities/user.entity';

@Controller('therapists')
export class TherapistController {
  constructor(private readonly therapistService: TherapistService) {}

  // PUBLIC
  @Get()
  findAll() {
    return this.therapistService.findAll();
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
