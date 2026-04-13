import { IsString, IsOptional, IsBoolean, IsUrl, MinLength, Matches } from 'class-validator';

export class UpdatePortfolioDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  tagline?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsUrl()
  @IsOptional()
  profilePhotoUrl?: string;

  @IsUrl()
  @IsOptional()
  coverPhotoUrl?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class UpdateSlugDto {
  @IsString()
  @MinLength(3)
  @Matches(/^[a-z0-9-]+$/, { 
    message: 'Slug can only contain lowercase letters, numbers, and hyphens' 
  })
  slug: string;
}