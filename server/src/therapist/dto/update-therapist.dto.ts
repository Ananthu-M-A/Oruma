import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { TherapistVerificationStatus } from '../entities/therapist-verification-status.enum';

export class UpdateTherapistDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  experience?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  group?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  couplePrice?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  voiceIntro?: string;

  @IsOptional()
  @IsString()
  qualifications?: string;

  @IsOptional()
  @IsString()
  awardingInstitution?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  verifiedExperienceHours?: number;

  @IsOptional()
  @IsString()
  professionalRegistrationNumber?: string;

  @IsOptional()
  @IsString()
  registrationAuthority?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  consultationType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sessionDurationMinutes?: number;

  @IsOptional()
  @IsString()
  engagementRelationship?: string;

  @IsOptional()
  @IsEnum(TherapistVerificationStatus)
  verificationStatus?: TherapistVerificationStatus;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  nextAvailableSlot?: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
