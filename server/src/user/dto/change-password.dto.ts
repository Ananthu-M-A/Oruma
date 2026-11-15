import { IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MaxLength(128)
  currentPassword: string;

  // bcrypt ignores everything past 72 bytes.
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  newPassword: string;
}
