import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PrivacyRequestStatus } from '../entities/privacy-request.entity';

export class ReviewPrivacyRequestDto {
  @IsIn([PrivacyRequestStatus.APPROVED, PrivacyRequestStatus.REJECTED]) status:
    | PrivacyRequestStatus.APPROVED
    | PrivacyRequestStatus.REJECTED;
  @IsOptional() @IsString() @MaxLength(2000) adminNote?: string;
}
