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
import { ExperienceService } from './experience.service';
import { CreateExperienceDto, UpdateExperienceDto } from './dto/experience.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('experience')
@UseGuards(JwtAuthGuard)
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  @Get()
  findAll(@Request() req) {
    return this.experienceService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.experienceService.findOne(req.user.id, id);
  }

  @Post()
  create(@Request() req, @Body() createExperienceDto: CreateExperienceDto) {
    return this.experienceService.create(req.user.id, createExperienceDto);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExperienceDto: UpdateExperienceDto,
  ) {
    return this.experienceService.update(req.user.id, id, updateExperienceDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.experienceService.remove(req.user.id, id);
  }
}