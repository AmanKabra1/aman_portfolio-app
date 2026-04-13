import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { UpdatePortfolioDto, UpdateSlugDto } from './dto/update-portfolio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PortfoliosService } from './portfolios.service';

@Controller('portfolios')
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  /**
   * Get my portfolio (authenticated)
   */
  @UseGuards(JwtAuthGuard)
  @Get('mine')
  getMyPortfolio(@Request() req) {
    return this.portfoliosService.getMyPortfolio(req.user.id);
  }

  /**
   * Get portfolio statistics
   */
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats(@Request() req) {
    return this.portfoliosService.getStats(req.user.id);
  }

  /**
   * Update my portfolio
   */
  @UseGuards(JwtAuthGuard)
  @Put('mine')
  updatePortfolio(@Request() req, @Body() updateDto: UpdatePortfolioDto) {
    return this.portfoliosService.updatePortfolio(req.user.id, updateDto);
  }

  /**
   * Update portfolio slug/URL
   */
  @UseGuards(JwtAuthGuard)
  @Patch('slug')
  updateSlug(@Request() req, @Body() updateSlugDto: UpdateSlugDto) {
    return this.portfoliosService.updateSlug(req.user.id, updateSlugDto);
  }

  /**
   * Toggle portfolio visibility (public/private)
   */
  @UseGuards(JwtAuthGuard)
  @Post('toggle-visibility')
  toggleVisibility(@Request() req) {
    return this.portfoliosService.toggleVisibility(req.user.id);
  }

  /**
   * Check slug availability
   */
  @Get('check-slug/:slug')
  checkSlug(@Param('slug') slug: string) {
    return this.portfoliosService.checkSlugAvailability(slug);
  }

  /**
   * Get public portfolio by username or slug
   */
  @Get('public/:identifier')
  getPublicPortfolio(@Param('identifier') identifier: string) {
    return this.portfoliosService.getPublicPortfolio(identifier);
  }
}