import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSkillDto, UpdateSkillDto } from './dto/skill.dto';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    const skills = await this.prisma.skill.findMany({
      orderBy: { category: 'asc' },
    });

    return {
      success: true,
      message: 'Skills retrieved successfully',
      data: skills,
    };
  }

  async findOne(id: number) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
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

  async create(createSkillDto: CreateSkillDto, userId: number) {
    const skill = await this.prisma.skill.create({
      data: {
        ...createSkillDto,
        portfolio: {
          connect: {
            userId: userId, // 🔥 REQUIRED
          },
        },
      },
    });

    return {
      success: true,
      message: 'Skill created successfully',
      data: skill,
    };
  }

  async update(id: number, updateSkillDto: UpdateSkillDto) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    const updatedSkill = await this.prisma.skill.update({
      where: { id },
      data: updateSkillDto,
    });

    return {
      success: true,
      message: 'Skill updated successfully',
      data: updatedSkill,
    };
  }

  async remove(id: number) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
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
}
