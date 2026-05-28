import { IsString, Length, MinLength } from 'class-validator';

export class VerifyLoginOtpDto {
  @IsString()
  @MinLength(5)
  identifier: string;

  @IsString()
  @Length(6, 6)
  code: string;
}
