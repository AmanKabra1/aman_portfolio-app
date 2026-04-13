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
import { EducationService } from './education.service';
import { CreateEducationDto, UpdateEducationDto } from './dto/education.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('education')
@UseGuards(JwtAuthGuard)
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @Get()
  findAll(@Request() req) {
    return this.educationService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.educationService.findOne(req.user.id, id);
  }

  @Post()
  create(@Request() req, @Body() createEducationDto: CreateEducationDto) {
    return this.educationService.create(req.user.id, createEducationDto);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEducationDto: UpdateEducationDto,
  ) {
    return this.educationService.update(req.user.id, id, updateEducationDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.educationService.remove(req.user.id, id);
  }
}