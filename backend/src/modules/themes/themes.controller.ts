import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ThemesService } from './themes.service';
import { UpdateThemeDto, ThemePresetDto } from './dto/update-theme.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  /**
   * Get my theme
   */
  @UseGuards(JwtAuthGuard)
  @Get('mine')
  getTheme(@Request() req) {
    return this.themesService.getTheme(req.user.id);
  }

  /**
   * Update theme
   */
  @UseGuards(JwtAuthGuard)
  @Put('mine')
  updateTheme(@Request() req, @Body() updateThemeDto: UpdateThemeDto) {
    return this.themesService.updateTheme(req.user.id, updateThemeDto);
  }

  /**
   * Apply theme preset
   */
  @UseGuards(JwtAuthGuard)
  @Post('preset')
  applyPreset(@Request() req, @Body() presetDto: ThemePresetDto) {
    return this.themesService.applyPreset(req.user.id, presetDto);
  }

  /**
   * Reset theme to default
   */
  @UseGuards(JwtAuthGuard)
  @Post('reset')
  resetTheme(@Request() req) {
    return this.themesService.resetTheme(req.user.id);
  }

  /**
   * Get available presets
   */
  @Get('presets')
  getPresets() {
    return this.themesService.getPresets();
  }

  /**
   * Get available fonts
   */
  @Get('fonts')
  getFonts() {
    return this.themesService.getAvailableFonts();
  }

  /**
   * Get available templates
   */
  @Get('templates')
  getTemplates() {
    return this.themesService.getAvailableTemplates();
  }

  /**
   * Get CSS variables
   */
  @UseGuards(JwtAuthGuard)
  @Get('css')
  getCssVariables(@Request() req) {
    return this.themesService.generateCssVariables(req.user.id);
  }
}