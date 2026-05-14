import { IsDateString, IsOptional } from 'class-validator';

export class UpdateAvailabilitySlotDto {
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;
}
