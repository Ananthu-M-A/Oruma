import {
  IsUUID,
  ValidateNested,
  ArrayMinSize,
  IsDateString,
} from 'class-validator';

import { Type } from 'class-transformer';

class BulkAvailabilitySlotDto {
  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}

export class BulkCreateAvailabilityDto {
  @IsUUID()
  therapistId: string;

  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BulkAvailabilitySlotDto)
  slots: BulkAvailabilitySlotDto[];
}
