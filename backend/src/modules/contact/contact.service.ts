import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async getContact(userId: number) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
      select: {
        email: true,
        phone: true,
        location: true,
        website: true,
      },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    return {
      success: true,
      message: 'Contact retrieved successfully',
      data: {
        email: portfolio.email ?? '',
        phone: portfolio.phone ?? '',
        location: portfolio.location ?? '',
        website: portfolio.website ?? '',
      },
    };
  }

  async updateContact(userId: number, updateData: any) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const updated = await this.prisma.portfolio.update({
      where: { userId },
      data: {
        email: updateData.email ?? undefined,
        phone: updateData.phone ?? undefined,
        location: updateData.location ?? undefined,
        website: updateData.website ?? undefined,
      },
      select: {
        email: true,
        phone: true,
        location: true,
        website: true,
      },
    });

    return {
      success: true,
      message: 'Contact updated successfully',
      data: {
        email: updated.email ?? '',
        phone: updated.phone ?? '',
        location: updated.location ?? '',
        website: updated.website ?? '',
      },
    };
  }
}
