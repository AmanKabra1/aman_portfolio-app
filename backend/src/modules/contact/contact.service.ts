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
        socialLinks: true,
      },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    // Group social links by platform
    const socialMap: Record<string, string> = {};
    for (const link of portfolio.socialLinks || []) {
      socialMap[link.platform.toLowerCase()] = link.url;
    }

    return {
      success: true,
      message: 'Contact retrieved successfully',
      data: {
        email: portfolio.email ?? '',
        phone: portfolio.phone ?? '',
        location: portfolio.location ?? '',
        website: portfolio.website ?? '',
        github: socialMap['github'] ?? '',
        linkedin: socialMap['linkedin'] ?? '',
        medium: socialMap['medium'] ?? '',
        tableau: socialMap['tableau'] ?? '',
        leetcode: socialMap['leetcode'] ?? '',
        instagram: socialMap['instagram'] ?? '',
        youtube: socialMap['youtube'] ?? '',
        portfolio: portfolio.website ?? '',
      },
    };
  }

  async updateContact(userId: number, updateData: {
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    github?: string;
    linkedin?: string;
    medium?: string;
    tableau?: string;
    leetcode?: string;
    instagram?: string;
    youtube?: string;
    portfolio?: string;
  }) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
      include: { socialLinks: true },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    // Update portfolio fields
    await this.prisma.portfolio.update({
      where: { userId },
      data: {
        email: updateData.email ?? undefined,
        phone: updateData.phone ?? undefined,
        location: updateData.location ?? undefined,
        website: updateData.portfolio ?? updateData.website ?? undefined,
      },
    });

    // Update social links
    const socialPlatforms = [
      { key: 'github', url: updateData.github },
      { key: 'linkedin', url: updateData.linkedin },
      { key: 'medium', url: updateData.medium },
      { key: 'tableau', url: updateData.tableau },
      { key: 'leetcode', url: updateData.leetcode },
      { key: 'instagram', url: updateData.instagram },
      { key: 'youtube', url: updateData.youtube },
    ];

    for (const platform of socialPlatforms) {
      const existingLink = portfolio.socialLinks?.find(
        l => l.platform.toLowerCase() === platform.key
      );

      if (platform.url) {
        if (existingLink) {
          // Update existing
          await this.prisma.socialLink.update({
            where: { id: existingLink.id },
            data: { url: platform.url },
          });
        } else {
          // Create new
          await this.prisma.socialLink.create({
            data: {
              portfolioId: portfolio.id,
              platform: platform.key,
              url: platform.url,
            },
          });
        }
      }
    }

    // Return updated data
    return this.getContact(userId);
  }
}
