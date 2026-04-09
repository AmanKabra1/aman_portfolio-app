import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateExperienceDto, UpdateExperienceDto } from './dto/experience.dto';

@Injectable()
export class ExperienceService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const experiences = await this.prisma.experience.findMany({
      orderBy: { startDate: 'desc' },
    });

    return {
      success: true,
      message: 'Experiences retrieved successfully',
      data: experiences,
    };
  }

  async findOne(id: number) {
    const experience = await this.prisma.experience.findUnique({
      where: { id },
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

  async create(createExperienceDto: CreateExperienceDto) {
    const experience = await this.prisma.experience.create({
      data: {
        ...createExperienceDto,
        startDate: new Date(createExperienceDto.startDate),
        endDate: new Date(createExperienceDto.endDate),
      },
    });

    return {
      success: true,
      message: 'Experience created successfully',
      data: experience,
    };
  }

  async update(id: number, updateExperienceDto: UpdateExperienceDto) {
    const experience = await this.prisma.experience.findUnique({
      where: { id },
    });

    if (!experience) {
      throw new NotFoundException('Experience not found');
    }

    const updateData: any = { ...updateExperienceDto };
    if (updateExperienceDto.startDate) {
      updateData.startDate = new Date(updateExperienceDto.startDate);
    }
    if (updateExperienceDto.endDate) {
      updateData.endDate = new Date(updateExperienceDto.endDate);
    }

    const updatedExperience = await this.prisma.experience.update({
      where: { id },
      data: updateData,
    });

    return {
      success: true,
      message: 'Experience updated successfully',
      data: updatedExperience,
    };
  }

  async remove(id: number) {
    const experience = await this.prisma.experience.findUnique({
      where: { id },
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
