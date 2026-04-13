import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateEducationDto, UpdateEducationDto } from './dto/education.dto';

@Injectable()
export class EducationService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const education = await this.prisma.education.findMany({
      where: { portfolioId: portfolio.id },
      orderBy: { startDate: 'desc' },
    });

    return {
      success: true,
      message: 'Education retrieved successfully',
      data: education,
    };
  }

  async findOne(userId: number, id: number) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const education = await this.prisma.education.findFirst({
      where: { 
        id,
        portfolioId: portfolio.id,
      },
    });

    if (!education) {
      throw new NotFoundException('Education not found');
    }

    return {
      success: true,
      message: 'Education retrieved successfully',
      data: education,
    };
  }

  async create(userId: number, createEducationDto: CreateEducationDto) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const education = await this.prisma.education.create({
      data: {
        ...createEducationDto,
        portfolioId: portfolio.id,
        startDate: new Date(createEducationDto.startDate),
        endDate: createEducationDto.endDate ? new Date(createEducationDto.endDate) : null,
      },
    });

    return {
      success: true,
      message: 'Education created successfully',
      data: education,
    };
  }

  async update(userId: number, id: number, updateEducationDto: UpdateEducationDto) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const education = await this.prisma.education.findFirst({
      where: { 
        id,
        portfolioId: portfolio.id,
      },
    });

    if (!education) {
      throw new NotFoundException('Education not found');
    }

    const updateData: any = { ...updateEducationDto };
    if (updateEducationDto.startDate) {
      updateData.startDate = new Date(updateEducationDto.startDate);
    }
    if (updateEducationDto.endDate) {
      updateData.endDate = new Date(updateEducationDto.endDate);
    }

    const updated = await this.prisma.education.update({
      where: { id },
      data: updateData,
    });

    return {
      success: true,
      message: 'Education updated successfully',
      data: updated,
    };
  }

  async remove(userId: number, id: number) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const education = await this.prisma.education.findFirst({
      where: { 
        id,
        portfolioId: portfolio.id,
      },
    });

    if (!education) {
      throw new NotFoundException('Education not found');
    }

    await this.prisma.education.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Education deleted successfully',
      data: null,
    };
  }
}