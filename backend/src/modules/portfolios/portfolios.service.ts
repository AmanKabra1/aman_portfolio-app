import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException,
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto, UpdateSlugDto } from './dto/update-portfolio.dto';
import slugify from 'slugify';

@Injectable()
export class PortfoliosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get user's own portfolio
   */
  async getMyPortfolio(userId: number) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
      include: {
        theme: true,
        skills: {
          where: { isVisible: true },
          orderBy: { order: 'asc' },
        },
        projects: {
          where: { isVisible: true },
          include: { technologies: true },
          orderBy: { order: 'asc' },
        },
        experiences: {
          where: { isVisible: true },
          orderBy: { startDate: 'desc' },
        },
        education: {
          where: { isVisible: true },
          orderBy: { startDate: 'desc' },
        },
        socialLinks: {
          where: { isVisible: true },
          orderBy: { order: 'asc' },
        },
        user: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    // Format projects to match expected structure
    const formattedProjects = portfolio.projects.map((project) => ({
      ...project,
      technologies: project.technologies.map((t) => t.technologyName),
    }));

    return {
      success: true,
      message: 'Portfolio retrieved successfully',
      data: {
        ...portfolio,
        projects: formattedProjects,
      },
    };
  }

  /**
   * Get public portfolio by username or slug
   */
  async getPublicPortfolio(identifier: string) {
    // Try to find by slug first, then by username
    let portfolio = await this.prisma.portfolio.findUnique({
      where: { slug: identifier.toLowerCase() },
      include: {
        theme: true,
        skills: {
          where: { isVisible: true },
          orderBy: { order: 'asc' },
        },
        projects: {
          where: { isVisible: true },
          include: { technologies: true },
          orderBy: { order: 'asc' },
        },
        experiences: {
          where: { isVisible: true },
          orderBy: { startDate: 'desc' },
        },
        education: {
          where: { isVisible: true },
          orderBy: { startDate: 'desc' },
        },
        socialLinks: {
          where: { isVisible: true },
          orderBy: { order: 'asc' },
        },
        user: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
      },
    });

    // If not found by slug, try by username
    if (!portfolio) {
      const user = await this.prisma.user.findUnique({
        where: { username: identifier.toLowerCase() },
        include: {
          portfolio: {
            include: {
              theme: true,
              skills: {
                where: { isVisible: true },
                orderBy: { order: 'asc' },
              },
              projects: {
                where: { isVisible: true },
                include: { technologies: true },
                orderBy: { order: 'asc' },
              },
              experiences: {
                where: { isVisible: true },
                orderBy: { startDate: 'desc' },
              },
              education: {
                where: { isVisible: true },
                orderBy: { startDate: 'desc' },
              },
              socialLinks: {
                where: { isVisible: true },
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      });

      if (user?.portfolio) {
        portfolio = { ...user.portfolio, user };
      }
    }

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    // Check if portfolio is public
    if (!portfolio.isPublic && !portfolio.isActive) {
      throw new ForbiddenException('This portfolio is not publicly accessible');
    }

    // Increment view count
    await this.prisma.portfolio.update({
      where: { id: portfolio.id },
      data: { viewCount: { increment: 1 } },
    });

    // Format projects
    const formattedProjects = portfolio.projects.map((project) => ({
      ...project,
      technologies: project.technologies.map((t) => t.technologyName),
    }));

    return {
      success: true,
      message: 'Portfolio retrieved successfully',
      data: {
        ...portfolio,
        projects: formattedProjects,
      },
    };
  }

  /**
   * Update portfolio
   */
  async updatePortfolio(userId: number, updateDto: UpdatePortfolioDto) {
    // Verify portfolio belongs to user
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const updated = await this.prisma.portfolio.update({
      where: { userId },
      data: updateDto,
      include: {
        theme: true,
        user: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Portfolio updated successfully',
      data: updated,
    };
  }

  /**
   * Update portfolio slug (URL)
   */
  async updateSlug(userId: number, updateSlugDto: UpdateSlugDto) {
    // Check if slug is already taken
    const existing = await this.prisma.portfolio.findUnique({
      where: { slug: updateSlugDto.slug.toLowerCase() },
    });

    if (existing && existing.userId !== userId) {
      throw new ConflictException('This URL is already taken');
    }

    const portfolio = await this.prisma.portfolio.update({
      where: { userId },
      data: { slug: updateSlugDto.slug.toLowerCase() },
    });

    return {
      success: true,
      message: 'Portfolio URL updated successfully',
      data: {
        slug: portfolio.slug,
        url: `/p/${portfolio.slug}`,
      },
    };
  }

  /**
   * Toggle portfolio visibility
   */
  async toggleVisibility(userId: number) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const updated = await this.prisma.portfolio.update({
      where: { userId },
      data: { isPublic: !portfolio.isPublic },
      select: {
        isPublic: true,
        slug: true,
      },
    });

    return {
      success: true,
      message: `Portfolio is now ${updated.isPublic ? 'public' : 'private'}`,
      data: updated,
    };
  }

  /**
   * Check slug availability
   */
  async checkSlugAvailability(slug: string, userId?: number) {
    const existing = await this.prisma.portfolio.findUnique({
      where: { slug: slug.toLowerCase() },
    });

    const available = !existing || (userId && existing.userId === userId);

    return {
      success: true,
      data: {
        slug: slug.toLowerCase(),
        available,
        suggestion: !available ? this.generateSlugSuggestion(slug) : null,
      },
    };
  }

  /**
   * Generate slug suggestion
   */
  private generateSlugSuggestion(baseSlug: string): string {
    const randomNum = Math.floor(Math.random() * 1000);
    return `${baseSlug}-${randomNum}`;
  }

  /**
   * Get portfolio statistics
   */
  async getStats(userId: number) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
      include: {
        _count: {
          select: {
            skills: true,
            projects: true,
            experiences: true,
            education: true,
          },
        },
      },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    return {
      success: true,
      data: {
        viewCount: portfolio.viewCount,
        isPublic: portfolio.isPublic,
        lastUpdated: portfolio.updatedAt,
        counts: {
          skills: portfolio._count.skills,
          projects: portfolio._count.projects,
          experiences: portfolio._count.experiences,
          education: portfolio._count.education,
        },
        completeness: this.calculateCompleteness(portfolio),
      },
    };
  }

  /**
   * Calculate portfolio completeness percentage
   */
  private calculateCompleteness(portfolio: any): number {
    let score = 0;
    const maxScore = 10;

    if (portfolio.title) score++;
    if (portfolio.bio) score++;
    if (portfolio.description) score++;
    if (portfolio.profilePhotoUrl) score++;
    if (portfolio.email) score++;
    if (portfolio.location) score++;
    if (portfolio._count?.skills > 0) score++;
    if (portfolio._count?.projects > 0) score++;
    if (portfolio._count?.experiences > 0) score++;
    if (portfolio._count?.education > 0) score++;

    return Math.round((score / maxScore) * 100);
  }
}