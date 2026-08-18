import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateAppointmentOperationsDto {
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(2000)
  meetingLink?: string;

  @IsOptional()
  @IsBoolean()
  markBookingConfirmationSent?: boolean;

  @IsOptional()
  @IsBoolean()
  markMeetingLinkSent?: boolean;

  @IsOptional()
  @IsBoolean()
  markReminderSent?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  staffNotes?: string;
}
