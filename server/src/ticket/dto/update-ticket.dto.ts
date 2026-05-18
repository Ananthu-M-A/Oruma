import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TicketStatus } from '../entities/ticket-status.enum';

export class UpdateTicketDto {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsString()
  adminNote?: string;
}
