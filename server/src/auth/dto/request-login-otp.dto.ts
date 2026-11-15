import { IsString, MaxLength, MinLength } from 'class-validator';

export class RequestLoginOtpDto {
  @IsString()
  @MinLength(5)
  @MaxLength(254)
  identifier: string;
}
