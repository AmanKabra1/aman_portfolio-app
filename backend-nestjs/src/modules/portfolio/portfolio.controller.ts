import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { UpdateAboutDto, UpdateContactDto } from './dto/portfolio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get('portfolio')
  getPortfolio() {
    return this.portfolioService.getPortfolio();
  }

  @Get('about')
  getAbout() {
    return this.portfolioService.getAbout();
  }

  @Get('contact')
  getContact() {
    return this.portfolioService.getContact();
  }

  @UseGuards(JwtAuthGuard)
  @Put('about')
  updateAbout(@Body() updateAboutDto: UpdateAboutDto) {
    return this.portfolioService.updateAbout(updateAboutDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('contact')
  updateContact(@Body() updateContactDto: UpdateContactDto) {
    return this.portfolioService.updateContact(updateContactDto);
  }
}
