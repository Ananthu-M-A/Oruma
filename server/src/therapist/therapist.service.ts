import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Therapist } from './entities/therapist.entity';

@Injectable()
export class TherapistService {
  constructor(
    @InjectRepository(Therapist)
    private readonly therapistRepository: Repository<Therapist>,
  ) {}

  findAll(): Promise<Therapist[]> {
    return this.therapistRepository.find({
      order: {
        displayOrder: 'ASC',
      },
    });
  }
}
