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
import { SkillsService } from './skills.service';
import { CreateSkillDto, UpdateSkillDto } from './dto/skill.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('skills')
@UseGuards(JwtAuthGuard)
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  findAll(@Request() req) {
    return this.skillsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.skillsService.findOne(req.user.id, id);
  }

  @Post()
  create(@Request() req, @Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.create(req.user.id, createSkillDto);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSkillDto: UpdateSkillDto,
  ) {
    return this.skillsService.update(req.user.id, id, updateSkillDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.skillsService.remove(req.user.id, id);
  }

  @Post('reorder')
  reorder(@Request() req, @Body() body: { skillIds: number[] }) {
    return this.skillsService.reorder(req.user.id, body.skillIds);
  }
}