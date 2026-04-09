import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateExperienceDto {
  @IsString()
  @IsNotEmpty({ message: 'Company is required' })
  company: string;

  @IsString()
  @IsNotEmpty({ message: 'Position is required' })
  position: string;

  @IsString()
  @IsNotEmpty({ message: 'Duration is required' })
  duration: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsDateString({}, { message: 'Start date must be a valid date' })
  startDate: string;

  @IsDateString({}, { message: 'End date must be a valid date' })
  endDate: string;
}

export class UpdateExperienceDto {
  @IsString()
  @IsNotEmpty({ message: 'Company is required' })
  company?: string;

  @IsString()
  @IsNotEmpty({ message: 'Position is required' })
  position?: string;

  @IsString()
  @IsNotEmpty({ message: 'Duration is required' })
  duration?: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description?: string;

  @IsDateString({}, { message: 'Start date must be a valid date' })
  startDate?: string;

  @IsDateString({}, { message: 'End date must be a valid date' })
  endDate?: string;
}
