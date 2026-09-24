import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class RefundPaymentDto {
  @IsInt()
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
