import { Controller, Get } from '@nestjs/common';
import { TherapistService } from './therapist.service';

@Controller('therapists')
export class TherapistController {
  constructor(private readonly therapistService: TherapistService) {}

  @Get()
  findAll() {
    return this.therapistService.findAll();
  }
}
