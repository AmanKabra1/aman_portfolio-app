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
        portfolioId: portfolio.id,
        title: projectData.title,
        description: projectData.description || '',
        imageUrl: projectData.image || '',
        liveUrl: projectData.liveLink || '',
        githubUrl: projectData.githubLink || '',
        featured: projectData.featured || false,
        startDate: projectData.startDate ? new Date(projectData.startDate) : null,
        endDate: projectData.endDate ? new Date(projectData.endDate) : null,
        status: projectData.status || 'completed',
        technologies: technologies ? {
          create: technologies.map((tech) => ({
            technologyName: tech,
          })),
        } : undefined,
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

    const updateData: any = {};
    if (projectData.title !== undefined) updateData.title = projectData.title;
    if (projectData.description !== undefined) updateData.description = projectData.description;
    if (projectData.image !== undefined) updateData.imageUrl = projectData.image;
    if (projectData.liveLink !== undefined) updateData.liveUrl = projectData.liveLink;
    if (projectData.githubLink !== undefined) updateData.githubUrl = projectData.githubLink;
    if (projectData.featured !== undefined) updateData.featured = projectData.featured;
    if (projectData.startDate !== undefined) updateData.startDate = projectData.startDate ? new Date(projectData.startDate) : null;
    if (projectData.endDate !== undefined) updateData.endDate = projectData.endDate ? new Date(projectData.endDate) : null;
    if (projectData.status !== undefined) updateData.status = projectData.status;

    if (technologies) {
      updateData.technologies = {
        deleteMany: {},
        create: technologies.map((tech) => ({
          technologyName: tech,
        })),
      };
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data: updateData,
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