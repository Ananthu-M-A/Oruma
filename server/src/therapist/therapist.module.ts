import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TherapistService } from './therapist.service';
import { TherapistController } from './therapist.controller';
import { Therapist } from './entities/therapist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Therapist])],
  providers: [TherapistService],
  controllers: [TherapistController],
})
export class TherapistModule {}
