import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateThemeDto, ThemePresetDto } from './dto/update-theme.dto';

@Injectable()
export class ThemesService {
  private readonly logger = new Logger(ThemesService.name);
  constructor(private prisma: PrismaService) { }

  // Predefined theme presets
  private readonly presets = {
    blue: {
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      accentColor: '#F59E0B',
    },
    green: {
      primaryColor: '#10B981',
      secondaryColor: '#3B82F6',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      accentColor: '#8B5CF6',
    },
    purple: {
      primaryColor: '#8B5CF6',
      secondaryColor: '#EC4899',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      accentColor: '#F59E0B',
    },
    orange: {
      primaryColor: '#F97316',
      secondaryColor: '#EF4444',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      accentColor: '#3B82F6',
    },
    red: {
      primaryColor: '#EF4444',
      secondaryColor: '#F97316',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      accentColor: '#10B981',
    },
    dark: {
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      backgroundColor: '#111827',
      textColor: '#F9FAFB',
      accentColor: '#F59E0B',
    },
    light: {
      primaryColor: '#6366F1',
      secondaryColor: '#14B8A6',
      backgroundColor: '#F9FAFB',
      textColor: '#111827',
      accentColor: '#F59E0B',
    },
  };

  /**
   * Get theme for user's portfolio
   */
  async getTheme(userId: number) {
    this.logger.log(`Getting theme for userId: ${userId}`);

    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
      include: { theme: true },
    });

    if (!portfolio) {
      this.logger.warn(`Portfolio not found for userId: ${userId}`);
      throw new NotFoundException('Portfolio not found');
    }

    this.logger.log(`Portfolio found: ${portfolio.id}, theme: ${portfolio.theme ? 'exists' : 'missing'}`);

    if (!portfolio.theme) {
      // Create default theme if doesn't exist
      const theme = await this.prisma.portfolioTheme.create({
        data: {
          portfolioId: portfolio.id,
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          backgroundColor: '#FFFFFF',
          textColor: '#1F2937',
          accentColor: '#F59E0B',
          template: 'modern',
        },
      });

      return {
        success: true,
        message: 'Theme retrieved successfully',
        data: theme,
      };
    }

    return {
      success: true,
      message: 'Theme retrieved successfully',
      data: portfolio.theme,
    };
  }

  /**
   * Update theme
   */
  async updateTheme(userId: number, updateThemeDto: UpdateThemeDto) {
    // Get portfolio
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
      include: { theme: true },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    let theme;

    if (portfolio.theme) {
      // Update existing theme
      theme = await this.prisma.portfolioTheme.update({
        where: { portfolioId: portfolio.id },
        data: updateThemeDto,
      });
    } else {
      // Create new theme
      theme = await this.prisma.portfolioTheme.create({
        data: {
          portfolioId: portfolio.id,
          ...updateThemeDto,
        },
      });
    }

    return {
      success: true,
      message: 'Theme updated successfully',
      data: theme,
    };
  }

  /**
   * Apply theme preset
   */
  async applyPreset(userId: number, presetDto: ThemePresetDto) {
    const preset = this.presets[presetDto.preset];

    if (!preset) {
      throw new NotFoundException('Theme preset not found');
    }

    return this.updateTheme(userId, preset);
  }

  /**
   * Get available theme presets
   */
  async getPresets() {
    return {
      success: true,
      data: Object.keys(this.presets).map((key) => ({
        name: key,
        colors: this.presets[key],
      })),
    };
  }

  /**
   * Reset theme to default
   */
  async resetTheme(userId: number) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
      include: { theme: true },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    if (!portfolio.theme) {
      throw new NotFoundException('Theme not found');
    }

    const theme = await this.prisma.portfolioTheme.update({
      where: { portfolioId: portfolio.id },
      data: {
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        accentColor: '#F59E0B',
        fontFamily: 'Inter',
        headingFont: 'Inter',
        fontSize: 'medium',
        template: 'modern',
        layout: 'single',
        showAbout: true,
        showSkills: true,
        showProjects: true,
        showExperience: true,
        showEducation: true,
        showContact: true,
      },
    });

    return {
      success: true,
      message: 'Theme reset to default',
      data: theme,
    };
  }

  /**
   * Get available fonts
   */
  async getAvailableFonts() {
    const fonts = [
      { name: 'Inter', category: 'Sans-serif', popular: true },
      { name: 'Roboto', category: 'Sans-serif', popular: true },
      { name: 'Open Sans', category: 'Sans-serif', popular: true },
      { name: 'Lato', category: 'Sans-serif', popular: false },
      { name: 'Montserrat', category: 'Sans-serif', popular: true },
      { name: 'Poppins', category: 'Sans-serif', popular: true },
      { name: 'Raleway', category: 'Sans-serif', popular: false },
      { name: 'PT Sans', category: 'Sans-serif', popular: false },
      { name: 'Merriweather', category: 'Serif', popular: false },
      { name: 'Playfair Display', category: 'Serif', popular: true },
      { name: 'Lora', category: 'Serif', popular: false },
      { name: 'Crimson Text', category: 'Serif', popular: false },
      { name: 'Fira Code', category: 'Monospace', popular: true },
      { name: 'Source Code Pro', category: 'Monospace', popular: false },
      { name: 'JetBrains Mono', category: 'Monospace', popular: true },
    ];

    return {
      success: true,
      data: fonts,
    };
  }

  /**
   * Get available templates
   */
  async getAvailableTemplates() {
    const templates = [
      {
        id: 'modern',
        name: 'Modern',
        description: 'Clean and contemporary design with bold typography',
        preview: '/templates/modern.png',
      },
      {
        id: 'classic',
        name: 'Classic',
        description: 'Traditional layout with elegant styling',
        preview: '/templates/classic.png',
      },
      {
        id: 'minimal',
        name: 'Minimal',
        description: 'Simplicity at its finest with lots of white space',
        preview: '/templates/minimal.png',
      },
      {
        id: 'creative',
        name: 'Creative',
        description: 'Unique and artistic design for creative professionals',
        preview: '/templates/creative.png',
      },
    ];

    return {
      success: true,
      data: templates,
    };
  }

  /**
   * Generate CSS variables for public portfolio
   */
  async generateCssVariablesPublic(slug: string) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { slug: slug.toLowerCase() },
      include: { theme: true },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const theme = portfolio.theme || {
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      accentColor: '#F59E0B',
      fontFamily: 'Inter',
      headingFont: 'Inter',
      fontSize: 'medium',
    };

    const cssVariables = `
      :root {
        --primary-color: ${theme.primaryColor};
        --secondary-color: ${theme.secondaryColor};
        --background-color: ${theme.backgroundColor};
        --text-color: ${theme.textColor};
        --accent-color: ${theme.accentColor};
        --font-family: ${theme.fontFamily}, sans-serif;
        --heading-font: ${theme.headingFont}, sans-serif;
        --font-size-base: ${theme.fontSize === 'small' ? '14px' : theme.fontSize === 'large' ? '18px' : '16px'};
      }
    `.trim();

    return {
      success: true,
      data: {
        css: cssVariables,
        theme,
      },
    };
  }

  /**
   * Generate CSS variables from theme
   */
  async generateCssVariables(userId: number) {
    const result = await this.getTheme(userId);
    const theme = result.data;

    const cssVariables = `
:root {
  --primary-color: ${theme.primaryColor};
  --secondary-color: ${theme.secondaryColor};
  --background-color: ${theme.backgroundColor};
  --text-color: ${theme.textColor};
  --accent-color: ${theme.accentColor};
  --font-family: ${theme.fontFamily}, sans-serif;
  --heading-font: ${theme.headingFont}, sans-serif;
  --font-size-base: ${theme.fontSize === 'small' ? '14px' : theme.fontSize === 'large' ? '18px' : '16px'};
}
    `.trim();

    return {
      success: true,
      data: {
        css: cssVariables,
        theme,
      },
    };
  }
}