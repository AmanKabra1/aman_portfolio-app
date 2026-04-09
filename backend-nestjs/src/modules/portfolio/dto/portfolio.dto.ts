import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';

export class UpdateAboutDto {
  @IsString()
  @IsNotEmpty({ message: 'Bio is required' })
  bio: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsInt({ message: 'Years of experience must be an integer' })
  @Min(0, { message: 'Years of experience must be at least 0' })
  yearsExperience: number;
}

export class UpdateContactDto {
  @IsString()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone is required' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Location is required' })
  location: string;

  @IsString()
  @IsOptional()
  github?: string;

  @IsString()
  @IsOptional()
  linkedin?: string;

  @IsString()
  @IsOptional()
  medium?: string;

  @IsString()
  @IsOptional()
  tableau?: string;

  @IsString()
  @IsOptional()
  leetcode?: string;

  @IsString()
  @IsOptional()
  instagram?: string;

  @IsString()
  @IsOptional()
  youtube?: string;

  @IsString()
  @IsOptional()
  portfolio?: string;
}
