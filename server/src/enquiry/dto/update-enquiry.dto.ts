import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EnquiryStatus } from '../entities/enquiry.entity';

export class UpdateEnquiryDto {
  @IsOptional()
  @IsEnum(EnquiryStatus)
  status?: EnquiryStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  adminNote?: string;
}
