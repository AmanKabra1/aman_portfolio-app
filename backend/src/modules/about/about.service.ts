import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AboutService {
  constructor(private prisma: PrismaService) {}

  async getAbout(userId: number) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
      select: {
        bio: true,
        description: true,
        yearsExperience: true,
      },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    return {
      success: true,
      message: 'About retrieved successfully',
      data: {
        bio: portfolio.bio ?? '',
        description: portfolio.description ?? '',
        yearsExperience: portfolio.yearsExperience ?? 0,
      },
    };
  }

  async updateAbout(userId: number, updateData: { bio?: string; description?: string; yearsExperience?: number }) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const updated = await this.prisma.portfolio.update({
      where: { userId },
      data: {
        bio: updateData.bio ?? undefined,
        description: updateData.description ?? undefined,
        yearsExperience: updateData.yearsExperience ?? undefined,
      },
      select: {
        bio: true,
        description: true,
        yearsExperience: true,
      },
    });

    return {
      success: true,
      message: 'About updated successfully',
      data: {
        bio: updated.bio ?? '',
        description: updated.description ?? '',
        yearsExperience: updated.yearsExperience ?? 0,
      },
    };
  }
}
