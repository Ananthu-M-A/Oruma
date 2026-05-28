import { IsString, MinLength } from 'class-validator';

export class RequestLoginOtpDto {
  @IsString()
  @MinLength(5)
  identifier: string;
}
