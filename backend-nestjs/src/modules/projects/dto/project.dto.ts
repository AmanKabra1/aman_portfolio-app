import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsString()
  @IsNotEmpty({ message: 'Image is required' })
  image: string;

  @IsString()
  @IsNotEmpty({ message: 'Live link is required' })
  liveLink: string;

  @IsString()
  @IsNotEmpty({ message: 'GitHub link is required' })
  githubLink: string;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one technology is required' })
  @IsString({ each: true })
  technologies: string[];
}

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  liveLink?: string;

  @IsString()
  @IsOptional()
  githubLink?: string;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  technologies?: string[];
}
