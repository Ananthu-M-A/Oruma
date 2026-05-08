import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  therapistId: string;

  @Type(() => Date)
  @IsDate()
  appointmentDate: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}
