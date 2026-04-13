import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GenerateResumeDto } from './dto/generate-resume.dto';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs/promises';
import * as path from 'path';
import { modernTemplate } from './templates/modern.template';
import { classicTemplate } from './templates/classic.template';

@Injectable()
export class ResumeService {
    constructor(private prisma: PrismaService) { }

    private formatDate(date: Date | string | null) {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
        });
    }

    private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');

    /**
     * Generate PDF resume
     */
    async generateResume(userId: number, dto: GenerateResumeDto) {
        // Get portfolio data
        const portfolio = await this.prisma.portfolio.findUnique({
            where: { userId },
            include: {
                theme: true,
                skills: {
                    where: { isVisible: true },
                    orderBy: { level: 'desc' },
                },
                projects: {
                    where: { isVisible: true },
                    include: { technologies: true },
                    orderBy: { featured: 'desc' },
                    take: 5,
                },
                experiences: {
                    where: { isVisible: true },
                    orderBy: { startDate: 'desc' },
                },
                education: {
                    where: { isVisible: true },
                    orderBy: { startDate: 'desc' },
                },
                user: {
                    select: {
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

        // Format projects
        const formattedProjects = portfolio.projects.map(p => ({
            ...p,
            technologies: p.technologies.map(t => t.technologyName),
        }));

        // Prepare data
        const formattedExperiences = portfolio.experiences.map(exp => ({
            ...exp,
            startDate: this.formatDate(exp.startDate),
            endDate: exp.isCurrent ? 'Present' : this.formatDate(exp.endDate),
        }));

        const formattedEducation = portfolio.education.map(edu => ({
            ...edu,
            startDate: this.formatDate(edu.startDate),
            endDate: edu.isCurrent ? 'Present' : this.formatDate(edu.endDate),
        }));

        const data = {
            user: portfolio.user,
            portfolio,
            theme: portfolio.theme,
            skills: portfolio.skills,
            projects: formattedProjects,
            experiences: formattedExperiences,
            education: formattedEducation,
        };

        // Get HTML template
        const template = dto.template || 'modern';
        const html = this.getTemplate(template, data);

        // Generate PDF
        const filename = `resume-${userId}-${Date.now()}.pdf`;
        const filepath = path.join(this.uploadsDir, filename);

        // Ensure directory exists
        await fs.mkdir(this.uploadsDir, { recursive: true });

        // Launch browser and generate PDF
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        await page.pdf({
            path: filepath,
            format: dto.paperSize === 'letter' ? 'letter' : 'a4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px',
            },
        });

        await browser.close();

        // Update portfolio with resume URL
        await this.prisma.portfolio.update({
            where: { userId },
            data: {
                resumeUrl: `/resumes/${filename}`,
                lastGeneratedAt: new Date(),
            },
        });

        return {
            success: true,
            message: 'Resume generated successfully',
            data: {
                filename,
                url: `/resumes/${filename}`,
                downloadUrl: `/api/resume/download/${filename}`,
            },
        };
    }

    /**
     * Get HTML template
     */
    private getTemplate(template: string, data: any): string {
        switch (template) {
            case 'classic':
                return classicTemplate(data);
            case 'modern':
            default:
                return modernTemplate(data);
        }
    }

    /**
     * Download resume
     */
    async downloadResume(filename: string) {
        const filepath = path.join(this.uploadsDir, filename);

        try {
            await fs.access(filepath);
            return filepath;
        } catch {
            throw new NotFoundException('Resume file not found');
        }
    }

    /**
     * Get available templates
     */
    async getTemplates() {
        return {
            success: true,
            data: [
                {
                    id: 'modern',
                    name: 'Modern',
                    description: 'Clean and contemporary design with bold colors',
                    preview: '/templates/modern-resume.png',
                },
                {
                    id: 'classic',
                    name: 'Classic',
                    description: 'Traditional serif font with elegant styling',
                    preview: '/templates/classic-resume.png',
                },
                {
                    id: 'minimal',
                    name: 'Minimal',
                    description: 'Simple and clean with lots of white space',
                    preview: '/templates/minimal-resume.png',
                },
                {
                    id: 'professional',
                    name: 'Professional',
                    description: 'Corporate style with structured layout',
                    preview: '/templates/professional-resume.png',
                },
            ],
        };
    }

    /**
     * Preview resume HTML (for testing)
     */
    async previewResume(userId: number, dto: GenerateResumeDto) {
        const portfolio = await this.prisma.portfolio.findUnique({
            where: { userId },
            include: {
                theme: true,
                skills: { where: { isVisible: true } },
                projects: {
                    where: { isVisible: true },
                    include: { technologies: true },
                    take: 5,
                },
                experiences: { where: { isVisible: true } },
                education: { where: { isVisible: true } },
                user: {
                    select: {
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

        const formattedProjects = portfolio.projects.map(p => ({
            ...p,
            technologies: p.technologies.map(t => t.technologyName),
        }));

        const data = {
            user: portfolio.user,
            portfolio,
            theme: portfolio.theme,
            skills: portfolio.skills,
            projects: formattedProjects,
            experiences: portfolio.experiences,
            education: portfolio.education,
        };

        const template = dto.template || 'modern';
        const html = this.getTemplate(template, data);

        return {
            success: true,
            data: {
                html,
            },
        };
    }
}