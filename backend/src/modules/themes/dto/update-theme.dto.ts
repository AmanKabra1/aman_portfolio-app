import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  Matches, 
  IsIn 
} from 'class-validator';

export class UpdateThemeDto {
  // Colors
  @IsString()
  @IsOptional()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Primary color must be a valid hex color',
  })
  primaryColor?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Secondary color must be a valid hex color',
  })
  secondaryColor?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Background color must be a valid hex color',
  })
  backgroundColor?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Text color must be a valid hex color',
  })
  textColor?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Accent color must be a valid hex color',
  })
  accentColor?: string;

  // Typography
  @IsString()
  @IsOptional()
  fontFamily?: string;

  @IsString()
  @IsOptional()
  headingFont?: string;

  @IsString()
  @IsOptional()
  @IsIn(['small', 'medium', 'large'], {
    message: 'Font size must be small, medium, or large',
  })
  fontSize?: string;

  // Layout
  @IsString()
  @IsOptional()
  @IsIn(['modern', 'classic', 'minimal', 'creative'], {
    message: 'Template must be modern, classic, minimal, or creative',
  })
  template?: string;

  @IsString()
  @IsOptional()
  @IsIn(['single', 'multi'], {
    message: 'Layout must be single or multi',
  })
  layout?: string;

  // Section Visibility
  @IsBoolean()
  @IsOptional()
  showAbout?: boolean;

  @IsBoolean()
  @IsOptional()
  showSkills?: boolean;

  @IsBoolean()
  @IsOptional()
  showProjects?: boolean;

  @IsBoolean()
  @IsOptional()
  showExperience?: boolean;

  @IsBoolean()
  @IsOptional()
  showEducation?: boolean;

  @IsBoolean()
  @IsOptional()
  showContact?: boolean;
}

export class ThemePresetDto {
  @IsString()
  @IsIn(['blue', 'green', 'purple', 'orange', 'red', 'dark', 'light'], {
    message: 'Invalid theme preset',
  })
  preset: string;
}