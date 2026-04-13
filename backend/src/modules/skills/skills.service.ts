import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSkillDto, UpdateSkillDto } from './dto/skill.dto';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all skills for current user's portfolio
   */
  async findAll(userId: number) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const skills = await this.prisma.skill.findMany({
      where: { portfolioId: portfolio.id },
      orderBy: { order: 'asc' },
    });

    return {
      success: true,
      message: 'Skills retrieved successfully',
      data: skills,
    };
  }

  /**
   * Get single skill
   */
  async findOne(userId: number, id: number) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const skill = await this.prisma.skill.findFirst({
      where: { 
        id,
        portfolioId: portfolio.id,
      },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return {
      success: true,
      message: 'Skill retrieved successfully',
      data: skill,
    };
  }

  /**
   * Create skill
   */
  async create(userId: number, createSkillDto: CreateSkillDto) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const skill = await this.prisma.skill.create({
      data: {
        ...createSkillDto,
        portfolioId: portfolio.id,
      },
    });

    return {
      success: true,
      message: 'Skill created successfully',
      data: skill,
    };
  }

  /**
   * Update skill
   */
  async update(userId: number, id: number, updateSkillDto: UpdateSkillDto) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const skill = await this.prisma.skill.findFirst({
      where: { 
        id,
        portfolioId: portfolio.id,
      },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    const updated = await this.prisma.skill.update({
      where: { id },
      data: updateSkillDto,
    });

    return {
      success: true,
      message: 'Skill updated successfully',
      data: updated,
    };
  }

  /**
   * Delete skill
   */
  async remove(userId: number, id: number) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const skill = await this.prisma.skill.findFirst({
      where: { 
        id,
        portfolioId: portfolio.id,
      },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    await this.prisma.skill.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Skill deleted successfully',
      data: null,
    };
  }

  /**
   * Reorder skills
   */
  async reorder(userId: number, skillIds: number[]) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    // Update order for each skill
    const updates = skillIds.map((id, index) =>
      this.prisma.skill.updateMany({
        where: { 
          id,
          portfolioId: portfolio.id,
        },
        data: { order: index },
      })
    );

    await Promise.all(updates);

    return {
      success: true,
      message: 'Skills reordered successfully',
    };
  }
}