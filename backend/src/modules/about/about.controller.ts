import { Controller, Get, Put, Body, UseGuards, Request, Req } from '@nestjs/common';
import { AboutService } from './about.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('about')
@UseGuards(JwtAuthGuard)
export class AboutController {
  constructor(private readonly aboutService: AboutService) {}

  @Get()
  findOne(@Req() req) {
    return this.aboutService.getAbout(req.user.id);
  }

  @Put()
  update(@Req() req, @Body() updateData: { bio?: string; description?: string }) {
    return this.aboutService.updateAbout(req.user.id, updateData);
  }
}
