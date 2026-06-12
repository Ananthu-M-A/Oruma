import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RefundPaymentDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsIn(['normal', 'optimum'])
  speed?: 'normal' | 'optimum';

  @IsOptional()
  @IsString()
  receipt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
