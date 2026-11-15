import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { IsBoundedTextRecord } from '../../user/dto/bounded-record.validator';

export class RegisterDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  // bcrypt ignores everything past 72 bytes, so longer passwords give a false
  // sense of strength.
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  age?: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  gender?: string;

  @IsOptional()
  @IsBoundedTextRecord()
  healthInfo?: Record<string, unknown>;
}
