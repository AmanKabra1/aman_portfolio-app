import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GenerateResumeDto } from './dto/generate-resume.dto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { modernTemplate } from './templates/modern.template';
import { classicTemplate } from './templates/classic.template';

// PDF generation with pdf-lib (doesn't require Chrome)
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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
     * Generate PDF resume using pdf-lib (cloud-friendly, no Chrome needed)
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

        // Generate PDF using pdf-lib
        const filename = `resume-${userId}-${Date.now()}.pdf`;
        const filepath = path.join(this.uploadsDir, filename);

        // Ensure directory exists
        await fs.mkdir(this.uploadsDir, { recursive: true });

        // Create PDF
        const pdfDoc = await PDFDocument.create();
        const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
        const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

        const page = pdfDoc.addPage([612, 792]); // Letter size
        const { width, height } = page.getSize();

        const primaryColor = portfolio.theme?.primaryColor || '#3B82F6';
        const textColor = portfolio.theme?.textColor || '#1F2937';
        const parsedPrimary = this.hexToRgb(primaryColor);
        const parsedText = this.hexToRgb(textColor);

        let y = height - 50;
        const leftMargin = 50;
        const rightMargin = width - 50;

        // Name/Header
        const fullName = `${portfolio.user?.firstName || ''} ${portfolio.user?.lastName || ''}`.trim() || 'Your Name';
        page.drawText(fullName, {
            x: leftMargin,
            y,
            size: 24,
            font: timesBold,
            color: parsedPrimary,
        });

        y -= 25;

        // Title
        if (portfolio.title) {
            page.drawText(portfolio.title, {
                x: leftMargin,
                y,
                size: 12,
                font: timesItalic,
                color: parsedText,
            });
            y -= 20;
        }

        // Contact info
        const contactParts: string[] = [];
        if (portfolio.email) contactParts.push(portfolio.email);
        if (portfolio.phone) contactParts.push(portfolio.phone);
        if (portfolio.location) contactParts.push(portfolio.location);
        if (contactParts.length > 0) {
            page.drawText(contactParts.join(' | '), {
                x: leftMargin,
                y,
                size: 10,
                font: timesRoman,
                color: parsedText,
            });
            y -= 25;
        }

        // Bio/Summary
        if (portfolio.bio) {
            page.drawText('Summary', {
                x: leftMargin,
                y,
                size: 14,
                font: timesBold,
                color: parsedPrimary,
            });
            y -= 15;
            page.drawText(portfolio.bio.substring(0, 200), {
                x: leftMargin,
                y,
                size: 10,
                font: timesRoman,
                color: parsedText,
                maxWidth: rightMargin - leftMargin,
            });
            y -= 35;
        }

        // Skills
        if (data.skills && data.skills.length > 0) {
            page.drawText('Skills', {
                x: leftMargin,
                y,
                size: 14,
                font: timesBold,
                color: parsedPrimary,
            });
            y -= 15;
            const skillsText = data.skills.slice(0, 10).map(s => s.name).join(', ');
            page.drawText(skillsText, {
                x: leftMargin,
                y,
                size: 10,
                font: timesRoman,
                color: parsedText,
                maxWidth: rightMargin - leftMargin,
            });
            y -= 30;
        }

        // Experience
        if (data.experiences && data.experiences.length > 0) {
            page.drawText('Experience', {
                x: leftMargin,
                y,
                size: 14,
                font: timesBold,
                color: parsedPrimary,
            });
            y -= 15;
            for (const exp of data.experiences.slice(0, 3)) {
                page.drawText(`${exp.position} at ${exp.company}`, {
                    x: leftMargin,
                    y,
                    size: 11,
                    font: timesBold,
                    color: parsedText,
                });
                y -= 12;
                page.drawText(`${exp.startDate} - ${exp.endDate}`, {
                    x: leftMargin,
                    y,
                    size: 9,
                    font: timesItalic,
                    color: parsedText,
                });
                y -= 12;
                if (exp.description) {
                    page.drawText(exp.description.substring(0, 100), {
                        x: leftMargin,
                        y,
                        size: 9,
                        font: timesRoman,
                        color: parsedText,
                        maxWidth: rightMargin - leftMargin,
                    });
                    y -= 20;
                }
            }
        }

        // Education
        if (data.education && data.education.length > 0) {
            page.drawText('Education', {
                x: leftMargin,
                y,
                size: 14,
                font: timesBold,
                color: parsedPrimary,
            });
            y -= 15;
            for (const edu of data.education.slice(0, 2)) {
                page.drawText(`${edu.degree} in ${edu.field || 'General Studies'}`, {
                    x: leftMargin,
                    y,
                    size: 11,
                    font: timesBold,
                    color: parsedText,
                });
                y -= 12;
                page.drawText(`${edu.institution} | ${edu.startDate} - ${edu.endDate}`, {
                    x: leftMargin,
                    y,
                    size: 9,
                    font: timesItalic,
                    color: parsedText,
                });
                y -= 20;
            }
        }

        // Save PDF
        const pdfBytes = await pdfDoc.save();
        await fs.writeFile(filepath, Buffer.from(pdfBytes));

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

    private hexToRgb(hex: string): any {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return rgb(
                parseInt(result[1], 16) / 255,
                parseInt(result[2], 16) / 255,
                parseInt(result[3], 16) / 255
            );
        }
        return rgb(0, 0, 0); // Default to black
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