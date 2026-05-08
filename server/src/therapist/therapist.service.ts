import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Therapist } from './entities/therapist.entity';
import { CreateTherapistDto } from './dto/create-therapist.dto';
import { UpdateTherapistDto } from './dto/update-therapist.dto';

@Injectable()
export class TherapistService {
  constructor(
    @InjectRepository(Therapist)
    private readonly therapistRepo: Repository<Therapist>,
  ) {}

  create(dto: CreateTherapistDto): Promise<Therapist> {
    const therapist = this.therapistRepo.create(dto);

    return this.therapistRepo.save(therapist);
  }

  findAll(): Promise<Therapist[]> {
    return this.therapistRepo.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Therapist> {
    const therapist = await this.therapistRepo.findOne({
      where: { id },
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    return therapist;
  }

  async update(id: string, dto: UpdateTherapistDto): Promise<Therapist> {
    const therapist = await this.findOne(id);

    Object.assign(therapist, dto);

    return this.therapistRepo.save(therapist);
  }

  async remove(id: string): Promise<{ message: string }> {
    const therapist = await this.findOne(id);

    await this.therapistRepo.remove(therapist);

    return {
      message: 'Therapist deleted successfully',
    };
  }
}
