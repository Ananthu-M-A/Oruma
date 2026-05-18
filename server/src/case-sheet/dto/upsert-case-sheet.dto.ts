import { IsOptional, IsString } from 'class-validator';

export class UpsertCaseSheetDto {
  @IsString()
  appointmentId: string;

  @IsOptional()
  @IsString()
  presentingConcern?: string;

  @IsOptional()
  @IsString()
  clinicalNotes?: string;

  @IsOptional()
  @IsString()
  interventionPlan?: string;

  @IsOptional()
  @IsString()
  followUpPlan?: string;
}
