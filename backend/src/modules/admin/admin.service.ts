import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all users with pagination
   */
  async getAllUsers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          portfolio: {
            select: {
              id: true,
              slug: true,
              isPublic: true,
              viewCount: true,
              _count: {
                select: {
                  skills: true,
                  projects: true,
                  experiences: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  /**
   * Get user details by ID
   */
  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        portfolio: {
          include: {
            theme: true,
            _count: {
              select: {
                skills: true,
                projects: true,
                experiences: true,
                education: true,
              },
            },
          },
        },
        settings: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove sensitive data
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      success: true,
      data: userWithoutPassword,
    };
  }

  /**
   * Update user (activate/deactivate, change role)
   */
  async updateUser(id: number, updateDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateDto,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
      },
    });

    return {
      success: true,
      message: 'User updated successfully',
      data: updated,
    };
  }

  /**
   * Delete user (soft delete by deactivating)
   */
  async deleteUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete by deactivating
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      success: true,
      message: 'User deactivated successfully',
    };
  }

  /**
   * Get system statistics
   */
  async getStatistics() {
    const [
      totalUsers,
      activeUsers,
      totalPortfolios,
      publicPortfolios,
      totalSkills,
      totalProjects,
      totalExperiences,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.portfolio.count(),
      this.prisma.portfolio.count({ where: { isPublic: true } }),
      this.prisma.skill.count(),
      this.prisma.project.count(),
      this.prisma.experience.count(),
    ]);

    // Get recent users
    const recentUsers = await this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    // Get most viewed portfolios
    const topPortfolios = await this.prisma.portfolio.findMany({
      take: 5,
      where: { isPublic: true },
      orderBy: { viewCount: 'desc' },
      select: {
        slug: true,
        viewCount: true,
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
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalPortfolios,
          publicPortfolios,
          totalSkills,
          totalProjects,
          totalExperiences,
        },
        recentUsers,
        topPortfolios,
      },
    };
  }

  /**
   * Get all public portfolios
   */
  async getAllPortfolios(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [portfolios, total] = await Promise.all([
      this.prisma.portfolio.findMany({
        skip,
        take: limit,
        orderBy: { viewCount: 'desc' },
        include: {
          user: {
            select: {
              username: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              skills: true,
              projects: true,
              experiences: true,
            },
          },
        },
      }),
      this.prisma.portfolio.count(),
    ]);

    return {
      success: true,
      data: {
        portfolios,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }
}