import { Transform } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  ENQUIRY_CONTACT_METHODS,
  ENQUIRY_SUBJECTS,
} from '../entities/enquiry.entity';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateEnquiryDto {
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @Transform(trim)
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @Matches(/^\+?[0-9\s()-]{7,20}$/, {
    message: 'Enter a valid phone number',
  })
  phone?: string;

  @IsIn(ENQUIRY_CONTACT_METHODS)
  preferredContact: (typeof ENQUIRY_CONTACT_METHODS)[number];

  @IsIn(ENQUIRY_SUBJECTS)
  subject: (typeof ENQUIRY_SUBJECTS)[number];

  @Transform(trim)
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  message: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Matches(/^\/[A-Za-z0-9/_-]*$/)
  pagePath?: string;

  @IsBoolean()
  @Equals(true, { message: 'Consent is required to send an enquiry' })
  consent: boolean;

  /**
   * Honeypot. The field is hidden from people, so only bots fill it in.
   * A filled-in value is accepted silently and discarded.
   */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  website?: string;
}
