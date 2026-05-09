import { IsUUID, IsDateString } from 'class-validator';

export class CreateAvailabilitySlotDto {
  @IsUUID()
  therapistId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}
