import { IsString, Length, MaxLength, MinLength } from 'class-validator';

export class VerifyLoginOtpDto {
  @IsString()
  @MinLength(5)
  @MaxLength(254)
  identifier: string;

  @IsString()
  @Length(6, 6)
  code: string;
}
