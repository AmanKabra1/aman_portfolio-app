import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    const projects = await this.prisma.project.findMany({
      include: {
        technologies: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to match Express format
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

  async findOne(id: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        technologies: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Transform to match Express format
    const formattedProject = {
      ...project,
      technologies: project.technologies.map((t) => t.technologyName),
    };

    return {
      success: true,
      message: 'Project retrieved successfully',
      data: formattedProject,
    };
  }

  async create(createProjectDto: CreateProjectDto, userId: number) {
    const { technologies, ...projectData } = createProjectDto;

    const project = await this.prisma.project.create({
      data: {
        ...projectData,

        portfolio: {
          connect: {
            userId: userId, // 🔥 REQUIRED
          },
        },

        technologies: {
          create: technologies.map((tech) => ({
            technologyName: tech,
          })),
        },
      },
      include: {
        technologies: true,
      },
    });

    return {
      ...project,
      technologies: project.technologies.map((t) => t.technologyName),
    };
  }

  async update(id: number, updateProjectDto: UpdateProjectDto) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const { technologies, ...projectData } = updateProjectDto;

    // Update project with technologies
    const updatedProject = await this.prisma.project.update({
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
      include: {
        technologies: true,
      },
    });

    // Transform to match Express format
    const formattedProject = {
      ...updatedProject,
      technologies: updatedProject.technologies.map((t) => t.technologyName),
    };

    return {
      success: true,
      message: 'Project updated successfully',
      data: formattedProject,
    };
  }

  async remove(id: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
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
