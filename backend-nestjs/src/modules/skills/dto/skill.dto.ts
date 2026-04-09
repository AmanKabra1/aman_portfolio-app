import { IsString, IsNotEmpty, IsInt, Min, Max } from 'class-validator';

export class CreateSkillDto {
  @IsString()
  @IsNotEmpty({ message: 'Skill name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  category: string;

  @IsInt({ message: 'Level must be an integer' })
  @Min(0, { message: 'Level must be at least 0' })
  @Max(100, { message: 'Level must be at most 100' })
  level: number;
}

export class UpdateSkillDto {
  @IsString()
  @IsNotEmpty({ message: 'Skill name is required' })
  name?: string;

  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  category?: string;

  @IsInt({ message: 'Level must be an integer' })
  @Min(0, { message: 'Level must be at least 0' })
  @Max(100, { message: 'Level must be at most 100' })
  level?: number;
}
