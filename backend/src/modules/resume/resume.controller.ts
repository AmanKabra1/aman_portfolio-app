import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ResumeService } from './resume.service';
import { GenerateResumeDto } from './dto/generate-resume.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';
import { createReadStream } from 'fs';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  /**
   * Generate resume PDF
   */
  @UseGuards(JwtAuthGuard)
  @Post('generate')
  generateResume(@Request() req, @Body() dto: GenerateResumeDto) {
    return this.resumeService.generateResume(req.user.id, dto);
  }

  /**
   * Preview resume HTML
   */
  @UseGuards(JwtAuthGuard)
  @Post('preview')
  previewResume(@Request() req, @Body() dto: GenerateResumeDto) {
    return this.resumeService.previewResume(req.user.id, dto);
  }

  /**
   * Download resume PDF
   */
  @Get('download/:filename')
  async downloadResume(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const filepath = await this.resumeService.downloadResume(filename);
    const file = createReadStream(filepath);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new StreamableFile(file);
  }

  /**
   * Get available templates
   */
  @Get('templates')
  getTemplates() {
    return this.resumeService.getTemplates();
  }
}