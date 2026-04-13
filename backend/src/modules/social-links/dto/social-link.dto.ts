import { IsString, IsNotEmpty, IsUrl, IsOptional, IsIn } from 'class-validator';

export class CreateSocialLinkDto {
  @IsString()
  @IsNotEmpty({ message: 'Platform is required' })
  @IsIn(['github', 'linkedin', 'twitter', 'instagram', 'facebook', 'youtube', 'medium', 'dev', 'stackoverflow', 'behance', 'dribbble', 'website'], {
    message: 'Invalid platform',
  })
  platform: string;

  @IsUrl({}, { message: 'Invalid URL format' })
  @IsNotEmpty({ message: 'URL is required' })
  url: string;

  @IsString()
  @IsOptional()
  username?: string;
}

export class UpdateSocialLinkDto {
  @IsString()
  @IsOptional()
  platform?: string;

  @IsUrl()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  username?: string;
}