import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  slotId: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([1])
  sessionCount?: number;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsIn(['Individual Therapy', 'Couple Therapy'])
  service?: string;

  @IsOptional()
  @IsIn(['Video', 'Audio'])
  mode?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  verificationToken?: string;
}
