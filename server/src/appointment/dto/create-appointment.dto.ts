import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  slotId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
