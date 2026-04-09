import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateAboutDto, UpdateContactDto } from './dto/portfolio.dto';

@Injectable()
export class PortfolioService {
  constructor(private prisma: PrismaService) {}

  async getPortfolio() {
    const [about, contact, skills, projects, experience] = await Promise.all([
      this.prisma.about.findFirst(),
      this.prisma.contact.findFirst(),
      this.prisma.skill.findMany({ orderBy: { category: 'asc' } }),
      this.prisma.project.findMany({
        include: { technologies: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.experience.findMany({ orderBy: { startDate: 'desc' } }),
    ]);

    // Transform projects to match Express format
    const formattedProjects = projects.map((project) => ({
      ...project,
      technologies: project.technologies.map((t) => t.technologyName),
    }));

    return {
      success: true,
      message: 'Portfolio data retrieved successfully',
      data: {
        about: about || null,
        contact: contact || null,
        skills,
        projects: formattedProjects,
        experience,
      },
    };
  }

  async getAbout() {
    const about = await this.prisma.about.findFirst();

    if (!about) {
      throw new NotFoundException('About data not found');
    }

    return {
      success: true,
      message: 'About data retrieved successfully',
      data: about,
    };
  }

  async getContact() {
    const contact = await this.prisma.contact.findFirst();

    if (!contact) {
      throw new NotFoundException('Contact data not found');
    }

    return {
      success: true,
      message: 'Contact data retrieved successfully',
      data: contact,
    };
  }

  async updateAbout(updateAboutDto: UpdateAboutDto) {
    // Check if about data exists
    const existingAbout = await this.prisma.about.findFirst();

    let about;
    if (existingAbout) {
      about = await this.prisma.about.update({
        where: { id: existingAbout.id },
        data: updateAboutDto,
      });
    } else {
      about = await this.prisma.about.create({
        data: updateAboutDto,
      });
    }

    return {
      success: true,
      message: 'About data updated successfully',
      data: about,
    };
  }

  async updateContact(updateContactDto: UpdateContactDto) {
    // Check if contact data exists
    const existingContact = await this.prisma.contact.findFirst();

    let contact;
    if (existingContact) {
      contact = await this.prisma.contact.update({
        where: { id: existingContact.id },
        data: updateContactDto,
      });
    } else {
      contact = await this.prisma.contact.create({
        data: updateContactDto,
      });
    }

    return {
      success: true,
      message: 'Contact data updated successfully',
      data: contact,
    };
  }
}
