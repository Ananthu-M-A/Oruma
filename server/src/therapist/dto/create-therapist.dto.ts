import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  THERAPIST_CONSULTATION_TYPES,
  THERAPIST_ENGAGEMENT_RELATIONSHIPS,
} from '../therapist-profile.constants';

export class CreateTherapistDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(25)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(25)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  areasOfPractice?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(15)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  languages?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(80)
  experience?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  couplePrice?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  image?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  imagePublicId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  voiceIntro?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  voiceIntroPublicId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  voiceIntroTranscript?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  qualifications?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  awardingInstitution?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100_000)
  verifiedExperienceHours?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  professionalRegistrationNumber?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  registrationAuthority?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  specialization?: string | null;

  @IsOptional()
  @IsIn(THERAPIST_CONSULTATION_TYPES)
  consultationType?: (typeof THERAPIST_CONSULTATION_TYPES)[number] | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(180)
  sessionDurationMinutes?: number | null;

  @IsOptional()
  @IsIn(THERAPIST_ENGAGEMENT_RELATIONSHIPS)
  engagementRelationship?:
    | (typeof THERAPIST_ENGAGEMENT_RELATIONSHIPS)[number]
    | null;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  bio?: string | null;
}
