import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '../../user/entities/user.entity';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(Role)
  role: Role = Role.PATIENT;
}
