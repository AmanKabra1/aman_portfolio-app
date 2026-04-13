import { IsString, IsNotEmpty, IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class CreateEducationDto {
  @IsString()
  @IsNotEmpty({ message: 'Institution is required' })
  institution: string;

  @IsString()
  @IsNotEmpty({ message: 'Degree is required' })
  degree: string;

  @IsString()
  @IsOptional()
  field?: string;

  @IsString()
  @IsOptional()
  grade?: string;

  @IsDateString({}, { message: 'Start date must be a valid date' })
  startDate: string;

  @IsDateString({}, { message: 'End date must be a valid date' })
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  isCurrent?: boolean;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateEducationDto {
  @IsString()
  @IsOptional()
  institution?: string;

  @IsString()
  @IsOptional()
  degree?: string;

  @IsString()
  @IsOptional()
  field?: string;

  @IsString()
  @IsOptional()
  grade?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  isCurrent?: boolean;

  @IsString()
  @IsOptional()
  description?: string;
}