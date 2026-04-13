import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSocialLinkDto, UpdateSocialLinkDto } from './dto/social-link.dto';

@Injectable()
export class SocialLinksService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const socialLinks = await this.prisma.socialLink.findMany({
      where: { portfolioId: portfolio.id },
      orderBy: { order: 'asc' },
    });

    return {
      success: true,
      message: 'Social links retrieved successfully',
      data: socialLinks,
    };
  }

  async findOne(userId: number, id: number) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const socialLink = await this.prisma.socialLink.findFirst({
      where: { 
        id,
        portfolioId: portfolio.id,
      },
    });

    if (!socialLink) {
      throw new NotFoundException('Social link not found');
    }

    return {
      success: true,
      message: 'Social link retrieved successfully',
      data: socialLink,
    };
  }

  async create(userId: number, createSocialLinkDto: CreateSocialLinkDto) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const socialLink = await this.prisma.socialLink.create({
      data: {
        ...createSocialLinkDto,
        portfolioId: portfolio.id,
      },
    });

    return {
      success: true,
      message: 'Social link created successfully',
      data: socialLink,
    };
  }

  async update(userId: number, id: number, updateSocialLinkDto: UpdateSocialLinkDto) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const socialLink = await this.prisma.socialLink.findFirst({
      where: { 
        id,
        portfolioId: portfolio.id,
      },
    });

    if (!socialLink) {
      throw new NotFoundException('Social link not found');
    }

    const updated = await this.prisma.socialLink.update({
      where: { id },
      data: updateSocialLinkDto,
    });

    return {
      success: true,
      message: 'Social link updated successfully',
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

    const socialLink = await this.prisma.socialLink.findFirst({
      where: { 
        id,
        portfolioId: portfolio.id,
      },
    });

    if (!socialLink) {
      throw new NotFoundException('Social link not found');
    }

    await this.prisma.socialLink.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Social link deleted successfully',
      data: null,
    };
  }
}