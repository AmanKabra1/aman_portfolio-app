import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SocialLinksService } from './social-links.service';
import { CreateSocialLinkDto, UpdateSocialLinkDto } from './dto/social-link.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('social-links')
@UseGuards(JwtAuthGuard)
export class SocialLinksController {
  constructor(private readonly socialLinksService: SocialLinksService) {}

  @Get()
  findAll(@Request() req) {
    return this.socialLinksService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.socialLinksService.findOne(req.user.id, id);
  }

  @Post()
  create(@Request() req, @Body() createSocialLinkDto: CreateSocialLinkDto) {
    return this.socialLinksService.create(req.user.id, createSocialLinkDto);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSocialLinkDto: UpdateSocialLinkDto,
  ) {
    return this.socialLinksService.update(req.user.id, id, updateSocialLinkDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.socialLinksService.remove(req.user.id, id);
  }
}