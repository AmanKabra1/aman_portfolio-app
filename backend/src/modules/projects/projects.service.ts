import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const projects = await this.prisma.project.findMany({
      where: { portfolioId: portfolio.id },
      include: { technologies: true },
      orderBy: { order: 'asc' },
    });

    const formattedProjects = projects.map((project) => ({
      ...project,
      technologies: project.technologies.map((t) => t.technologyName),
    }));

    return {
      success: true,
      message: 'Projects retrieved successfully',
      data: formattedProjects,
    };
  }

  async findOne(userId: number, id: number) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const project = await this.prisma.project.findFirst({
      where: { 
        id,
        portfolioId: portfolio.id,
      },
      include: { technologies: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return {
      success: true,
      message: 'Project retrieved successfully',
      data: {
        ...project,
        technologies: project.technologies.map((t) => t.technologyName),
      },
    };
  }

  async create(userId: number, createProjectDto: CreateProjectDto) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const { technologies, ...projectData } = createProjectDto;

    const project = await this.prisma.project.create({
      data: {
        ...projectData,
        portfolioId: portfolio.id,
        technologies: {
          create: technologies.map((tech) => ({
            technologyName: tech,
          })),
        },
      },
      include: { technologies: true },
    });

    return {
      success: true,
      message: 'Project created successfully',
      data: {
        ...project,
        technologies: project.technologies.map((t) => t.technologyName),
      },
    };
  }

  async update(userId: number, id: number, updateProjectDto: UpdateProjectDto) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const project = await this.prisma.project.findFirst({
      where: { 
        id,
        portfolioId: portfolio.id,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const { technologies, ...projectData } = updateProjectDto;

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        ...projectData,
        ...(technologies && {
          technologies: {
            deleteMany: {},
            create: technologies.map((tech) => ({
              technologyName: tech,
            })),
          },
        }),
      },
      include: { technologies: true },
    });

    return {
      success: true,
      message: 'Project updated successfully',
      data: {
        ...updated,
        technologies: updated.technologies.map((t) => t.technologyName),
      },
    };
  }

  async remove(userId: number, id: number) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const project = await this.prisma.project.findFirst({
      where: { 
        id,
        portfolioId: portfolio.id,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.prisma.project.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Project deleted successfully',
      data: null,
    };
  }
}