import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PrivacyRequestType } from '../entities/privacy-request.entity';

export class CreatePrivacyRequestDto {
  @IsIn(Object.values(PrivacyRequestType)) type: PrivacyRequestType;
  @IsOptional() @IsString() @MaxLength(2000) reason?: string;
}
