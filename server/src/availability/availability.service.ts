import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

import { AvailabilitySlot } from './entities/availability-slot.entity';
import { Therapist } from '../therapist/entities/therapist.entity';
import { SlotStatus } from './entities/slot-status.enum';

import { CreateAvailabilitySlotDto } from './dto/create-availability-slot.dto';
import { BulkCreateAvailabilityDto } from './dto/bulk-create-availability.dto';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateOwnAvailabilitySlotDto } from './dto/create-own-availability-slot.dto';
import { UpdateAvailabilitySlotDto } from './dto/update-availability-slot.dto';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(AvailabilitySlot)
    private slotRepo: Repository<AvailabilitySlot>,

    @InjectRepository(Therapist)
    private therapistRepo: Repository<Therapist>,
  ) {}

  async create(dto: CreateAvailabilitySlotDto) {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    this.validateSlotTime(startTime, endTime);

    const therapist = await this.therapistRepo.findOne({
      where: { id: dto.therapistId },
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    await this.assertNoOverlap(dto.therapistId, startTime, endTime);

    const slot = this.slotRepo.create({
      therapist,
      startTime,
      endTime,
    });

    return this.slotRepo.save(slot);
  }

  private validateSlotTime(startTime: Date, endTime: Date) {
    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      throw new BadRequestException('Invalid slot time');
    }

    if (startTime <= new Date()) {
      throw new BadRequestException('Past time slots cannot be added');
    }

    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    const oneHourMs = 60 * 60 * 1000;
    if (endTime.getTime() - startTime.getTime() !== oneHourMs) {
      throw new BadRequestException('Standard therapy slots must be 1 hour');
    }
  }

  private async assertNoOverlap(
    therapistId: string,
    startTime: Date,
    endTime: Date,
    excludeSlotId?: string,
  ) {
    const overlapping = await this.slotRepo
      .createQueryBuilder('slot')
      .where('slot.therapistId = :therapistId', {
        therapistId,
      })
      .andWhere(excludeSlotId ? 'slot.id != :excludeSlotId' : '1 = 1', {
        excludeSlotId,
      })
      .andWhere(
        `(
          slot.startTime < :endTime
          AND
          slot.endTime > :startTime
        )`,
        {
          startTime,
          endTime,
        },
      )
      .getOne();

    if (overlapping) {
      throw new BadRequestException('Overlapping slot exists');
    }
  }

  async createOwn(dto: CreateOwnAvailabilitySlotDto, user: JwtPayload) {
    const therapist = await this.findTherapistForUser(user);

    return this.create({
      ...dto,
      therapistId: therapist.id,
    });
  }

  async bulkCreate(dto: BulkCreateAvailabilityDto) {
    const results: AvailabilitySlot[] = [];

    for (const slot of dto.slots) {
      results.push(
        await this.create({
          ...slot,
          therapistId: dto.therapistId,
        }),
      );
    }

    return results;
  }

  async getAvailableSlots(therapistId: string) {
    return this.slotRepo.find({
      where: {
        therapist: {
          id: therapistId,
        },
        status: SlotStatus.AVAILABLE,
        startTime: MoreThan(new Date()),
      },
      order: {
        startTime: 'ASC',
      },
    });
  }

  async getOwnSlots(user: JwtPayload) {
    const therapist = await this.findTherapistForUser(user);

    return this.slotRepo.find({
      where: {
        therapist: {
          id: therapist.id,
        },
      },
      order: {
        startTime: 'ASC',
      },
    });
  }

  async update(slotId: string, dto: UpdateAvailabilitySlotDto, user: JwtPayload) {
    const slot = await this.findOwnedSlot(slotId, user);

    if (slot.status === SlotStatus.BOOKED) {
      throw new BadRequestException('Booked slots cannot be edited');
    }

    const startTime = dto.startTime ? new Date(dto.startTime) : slot.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : slot.endTime;

    this.validateSlotTime(startTime, endTime);

    await this.assertNoOverlap(slot.therapist.id, startTime, endTime, slotId);

    slot.startTime = startTime;
    slot.endTime = endTime;

    return this.slotRepo.save(slot);
  }

  async markBooked(slotId: string) {
    const slot = await this.slotRepo.findOne({
      where: { id: slotId },
    });

    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    if (slot.status !== SlotStatus.AVAILABLE) {
      throw new BadRequestException('Slot unavailable');
    }

    slot.status = SlotStatus.BOOKED;

    return this.slotRepo.save(slot);
  }

  async delete(slotId: string, user?: JwtPayload) {
    const slot = user
      ? await this.findOwnedSlot(slotId, user)
      : await this.slotRepo.findOne({
          where: { id: slotId },
        });

    if (!slot) throw new NotFoundException('Slot not found');

    if (slot.status === SlotStatus.BOOKED) {
      throw new BadRequestException('Booked slots cannot be deleted');
    }

    await this.slotRepo.remove(slot);

    return {
      message: 'Slot deleted',
    };
  }

  private async findTherapistForUser(user: JwtPayload) {
    const therapist = await this.therapistRepo.findOne({
      where: {
        account: {
          id: user.userId,
        },
      },
    });

    if (!therapist) {
      throw new NotFoundException('Therapist profile not found');
    }

    return therapist;
  }

  private async findOwnedSlot(slotId: string, user: JwtPayload) {
    const slot = await this.slotRepo.findOne({
      where: { id: slotId },
      relations: ['therapist', 'therapist.account'],
    });

    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    if (slot.therapist.account?.id !== user.userId) {
      throw new ForbiddenException('You can only manage your own slots');
    }

    return slot;
  }
}
