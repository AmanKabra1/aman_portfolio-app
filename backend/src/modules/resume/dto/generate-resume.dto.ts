import { IsString, IsOptional, IsIn } from 'class-validator';

export class GenerateResumeDto {
  @IsString()
  @IsOptional()
  @IsIn(['modern', 'classic', 'minimal', 'professional'], {
    message: 'Template must be modern, classic, minimal, or professional',
  })
  template?: string;

  @IsString()
  @IsOptional()
  @IsIn(['a4', 'letter'], {
    message: 'Paper size must be a4 or letter',
  })
  paperSize?: string;
}