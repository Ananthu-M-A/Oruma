import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { IsBoundedTextRecord } from './bounded-record.validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  fullName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(120)
  age?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  gender?: string | null;

  @IsOptional()
  @IsBoundedTextRecord()
  healthInfo?: Record<string, unknown> | null;
}
