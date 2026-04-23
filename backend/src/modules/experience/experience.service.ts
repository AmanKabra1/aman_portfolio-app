import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateExperienceDto, UpdateExperienceDto } from './dto/experience.dto';

@Injectable()
export class ExperienceService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const experiences = await this.prisma.experience.findMany({
      where: { portfolioId: portfolio.id },
      orderBy: { startDate: 'desc' },
    });

    return {
      success: true,
      message: 'Experiences retrieved successfully',
      data: experiences,
    };
  }

  async findOne(userId: number, id: number) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const experience = await this.prisma.experience.findFirst({
      where: { 
        id,
        portfolioId: portfolio.id,
      },
    });

    if (!experience) {
      throw new NotFoundException('Experience not found');
    }

    return {
      success: true,
      message: 'Experience retrieved successfully',
      data: experience,
    };
  }

  async create(userId: number, createExperienceDto: CreateExperienceDto) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const experience = await this.prisma.experience.create({
      data: {
        portfolioId: portfolio.id,
        company: createExperienceDto.company,
        position: createExperienceDto.position,
        duration: createExperienceDto.duration || '',
        description: createExperienceDto.description || '',
        startDate: new Date(createExperienceDto.startDate),
        endDate: createExperienceDto.endDate ? new Date(createExperienceDto.endDate) : null,
        isCurrent: createExperienceDto.isCurrent || false,
      },
    });

    return {
      success: true,
      message: 'Experience created successfully',
      data: experience,
    };
  }

  async update(userId: number, id: number, updateExperienceDto: UpdateExperienceDto) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const experience = await this.prisma.experience.findFirst({
      where: {
        id,
        portfolioId: portfolio.id,
      },
    });

    if (!experience) {
      throw new NotFoundException('Experience not found');
    }

    const updateData: any = {};
    if (updateExperienceDto.company !== undefined) updateData.company = updateExperienceDto.company;
    if (updateExperienceDto.position !== undefined) updateData.position = updateExperienceDto.position;
    if (updateExperienceDto.duration !== undefined) updateData.duration = updateExperienceDto.duration;
    if (updateExperienceDto.description !== undefined) updateData.description = updateExperienceDto.description;
    if (updateExperienceDto.startDate !== undefined) updateData.startDate = new Date(updateExperienceDto.startDate);
    if (updateExperienceDto.endDate !== undefined) {
      updateData.endDate = updateExperienceDto.endDate ? new Date(updateExperienceDto.endDate) : null;
    }
    if (updateExperienceDto.isCurrent !== undefined) updateData.isCurrent = updateExperienceDto.isCurrent;

    const updated = await this.prisma.experience.update({
      where: { id },
      data: updateData,
    });

    return {
      success: true,
      message: 'Experience updated successfully',
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

    const experience = await this.prisma.experience.findFirst({
      where: { 
        id,
        portfolioId: portfolio.id,
      },
    });

    if (!experience) {
      throw new NotFoundException('Experience not found');
    }

    await this.prisma.experience.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Experience deleted successfully',
      data: null,
    };
  }
}