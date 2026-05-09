import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AvailabilitySlot } from './entities/availability-slot.entity';
import { Therapist } from '../therapist/entities/therapist.entity';
import { SlotStatus } from './entities/slot-status.enum';

import { CreateAvailabilitySlotDto } from './dto/create-availability-slot.dto';
import { BulkCreateAvailabilityDto } from './dto/bulk-create-availability.dto';

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

    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    const therapist = await this.therapistRepo.findOne({
      where: { id: dto.therapistId },
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    const overlapping = await this.slotRepo
      .createQueryBuilder('slot')
      .where('slot.therapistId = :therapistId', {
        therapistId: dto.therapistId,
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

    const slot = this.slotRepo.create({
      therapist,
      startTime,
      endTime,
    });

    return this.slotRepo.save(slot);
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
      },
      order: {
        startTime: 'ASC',
      },
    });
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

  async delete(slotId: string) {
    const slot = await this.slotRepo.findOne({
      where: { id: slotId },
    });

    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    if (slot.status === SlotStatus.BOOKED) {
      throw new BadRequestException('Booked slots cannot be deleted');
    }

    await this.slotRepo.remove(slot);

    return {
      message: 'Slot deleted',
    };
  }
}
