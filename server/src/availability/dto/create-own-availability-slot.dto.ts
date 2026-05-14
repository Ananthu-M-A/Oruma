import { IsDateString } from 'class-validator';

export class CreateOwnAvailabilitySlotDto {
  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}
